// Shared download helpers for movies and trailers
const TRAILER_STREAM_ENDPOINTS = [
    (key) => `https://piped.video/api/v1/streams/${key}`,
    (key) => `https://piped.video/api/v1/streams/${key}?local=true`
];

function notifyDownload(message, type = 'info') {
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    } else {
        const logMethod = type === 'danger' ? 'error' : type === 'warning' ? 'warn' : 'log';
        console[logMethod](message);
    }
}

function slugifyForFile(value) {
    return (value || 'movie')
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .substring(0, 60) || 'movie';
}

async function ensureTrailerDownloadAuth() {
    if (typeof checkAuthStatus !== 'function') {
        return true;
    }
    if (window.isUserLoggedIn === undefined) {
        window.isUserLoggedIn = await checkAuthStatus();
    }
    if (window.isUserLoggedIn) {
        return true;
    }
    if (typeof showLoginPrompt === 'function') {
        showLoginPrompt('Please login to download trailers');
    } else {
        alert('Please login to download trailers');
    }
    return false;
}

async function ensureMovieDownloadAuth() {
    if (typeof checkAuthStatus !== 'function') {
        return true;
    }
    if (window.isUserLoggedIn === undefined) {
        window.isUserLoggedIn = await checkAuthStatus();
    }
    if (window.isUserLoggedIn) {
        return true;
    }
    if (typeof showLoginPrompt === 'function') {
        showLoginPrompt('Please login to download movies');
    } else {
        alert('Please login to download movies');
    }
    return false;
}

async function downloadMovie(movieId, movieTitle = '') {
    try {
        // Check authentication first
        const canDownload = await ensureMovieDownloadAuth();
        if (!canDownload) {
            return;
        }
        
        if (!MovieAPI.isApiKeyConfigured()) {
            notifyDownload('Movie downloads require a configured TMDB API key.', 'warning');
            return;
        }
        notifyDownload('Preparing movie assets...', 'info');
        const movieDetails = await MovieAPI.getMovieDetails(movieId);
        if (!movieDetails) {
            throw new Error('Movie details are unavailable at the moment.');
        }
        const assetUrl = movieDetails.backdrop_path
            ? MovieAPI.getBackdropUrl(movieDetails.backdrop_path)
            : movieDetails.poster_path
                ? MovieAPI.getPosterUrl(movieDetails.poster_path)
                : null;
        if (!assetUrl) {
            throw new Error('No downloadable artwork found for this movie.');
        }
        const filenameBase = slugifyForFile(movieTitle || movieDetails.title || `movie-${movieId}`);
        await downloadBinaryFile(assetUrl, `${filenameBase}.jpg`);
        await downloadTextFile(JSON.stringify({
            id: movieDetails.id,
            title: movieDetails.title,
            release_date: movieDetails.release_date,
            overview: movieDetails.overview,
            rating: movieDetails.vote_average
        }, null, 2), `${filenameBase}.json`);
        notifyDownload('Movie artwork and details download started.', 'success');
    } catch (error) {
        console.error('Movie download failed:', error);
        notifyDownload(error.message || 'Unable to download movie assets.', 'danger');
    }
}

async function downloadTrailer(movieId, movieTitle = '') {
    try {
        if (!MovieAPI.isApiKeyConfigured()) {
            notifyDownload('Trailer downloads require a configured TMDB API key.', 'warning');
            return;
        }
        const canDownload = await ensureTrailerDownloadAuth();
        if (!canDownload) {
            return;
        }
        notifyDownload('Preparing trailer download...', 'info');
        const videos = await MovieAPI.getMovieVideos(movieId);
        const trailer = getPreferredTrailer(videos);
        if (!trailer) {
            throw new Error('No trailer available to download for this movie.');
        }
        const downloadUrl = await resolveTrailerDownloadUrl(trailer.key);
        if (!downloadUrl) {
            if (trailer.watchUrl) {
                window.open(trailer.watchUrl, '_blank');
                notifyDownload('Direct download unavailable. Opened trailer in a new tab.', 'warning');
            } else {
                throw new Error('Unable to locate a downloadable stream for this trailer.');
            }
            return;
        }
        const filenameBase = slugifyForFile(movieTitle || trailer.name || `trailer-${movieId}`);
        await downloadBinaryFile(downloadUrl, `${filenameBase}.mp4`);
        notifyDownload('Trailer download started.', 'success');
    } catch (error) {
        console.error('Trailer download failed:', error);
        notifyDownload(error.message || 'Unable to download trailer.', 'danger');
    }
}

function getPreferredTrailer(videos) {
    if (!videos || !Array.isArray(videos.results)) {
        return null;
    }
    const results = videos.results;
    const official = results.find(video =>
        video.site === 'YouTube' &&
        video.type === 'Trailer' &&
        (video.official === true || (video.name || '').toLowerCase().includes('official'))
    );
    const fallbackTrailer = results.find(video => video.site === 'YouTube' && video.type === 'Trailer');
    const fallbackVideo = results.find(video => video.site === 'YouTube');
    const selected = official || fallbackTrailer || fallbackVideo;
    if (!selected) {
        return null;
    }
    return {
        key: selected.key,
        name: selected.name,
        watchUrl: typeof YOUTUBE_WATCH_URL !== 'undefined' ? `${YOUTUBE_WATCH_URL}${selected.key}` : `https://www.youtube.com/watch?v=${selected.key}`
    };
}

async function resolveTrailerDownloadUrl(videoKey) {
    if (!videoKey) {
        return null;
    }
    for (const endpointBuilder of TRAILER_STREAM_ENDPOINTS) {
        const endpoint = endpointBuilder(videoKey);
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                continue;
            }
            const data = await response.json();
            if (data && Array.isArray(data.videoStreams)) {
                const mp4Stream = data.videoStreams.find(stream => (stream.mimeType || '').includes('mp4') && stream.url);
                if (mp4Stream) {
                    return mp4Stream.url;
                }
            }
        } catch (error) {
            console.warn('Trailer stream endpoint failed:', error);
        }
    }
    return null;
}

async function downloadBinaryFile(url, filename) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch the requested file.');
    }
    const blob = await response.blob();
    triggerBlobDownload(blob, filename);
}

async function downloadTextFile(text, filename) {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    triggerBlobDownload(blob, filename);
}

function triggerBlobDownload(blob, filename) {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
}

