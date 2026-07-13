// API Configuration
const API_KEY = '65ec24b90439e35088f030bae868a13c'; // TMDB API key
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const YOUTUBE_BASE_URL = 'https://www.youtube.com/embed/';
const YOUTUBE_WATCH_URL = 'https://www.youtube.com/watch?v=';
const MOVIE_EMBED_BASE_URL = 'https://vidsrc.to/embed/movie/';

// API Functions
class MovieAPI {
    // Check if API key is configured
    static isApiKeyConfigured() {
        return API_KEY && API_KEY !== 'YOUR_API_KEY_HERE';
    }

    // Validate API response
    static validateResponse(response, data) {
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your TMDB API key.');
            } else if (response.status === 404) {
                throw new Error('Resource not found.');
            } else {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }
        }
        if (data.errors) {
            throw new Error(data.errors.join(', '));
        }
        return data;
    }

    // Fetch popular movies
    static async getPopularMovies(page = 1) {
        try {
            if (!this.isApiKeyConfigured()) {
                throw new Error('API key not configured. Please add your TMDB API key in js/api.js');
            }
            const response = await fetch(`${API_BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
            const data = await response.json();
            return this.validateResponse(response, data);
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            return { error: error.message, results: [] };
        }
    }

    // Fetch top rated movies
    static async getTopRatedMovies(page = 1) {
        try {
            if (!this.isApiKeyConfigured()) {
                throw new Error('API key not configured. Please add your TMDB API key in js/api.js');
            }
            const response = await fetch(`${API_BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`);
            const data = await response.json();
            return this.validateResponse(response, data);
        } catch (error) {
            console.error('Error fetching top rated movies:', error);
            return { error: error.message, results: [] };
        }
    }

    // Fetch now playing movies
    static async getNowPlayingMovies(page = 1) {
        try {
            if (!this.isApiKeyConfigured()) {
                throw new Error('API key not configured. Please add your TMDB API key in js/api.js');
            }
            const response = await fetch(`${API_BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`);
            const data = await response.json();
            return this.validateResponse(response, data);
        } catch (error) {
            console.error('Error fetching now playing movies:', error);
            return { error: error.message, results: [] };
        }
    }

    // Fetch upcoming movies
    static async getUpcomingMovies(page = 1) {
        try {
            if (!this.isApiKeyConfigured()) {
                throw new Error('API key not configured. Please add your TMDB API key in js/api.js');
            }
            const response = await fetch(`${API_BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=${page}`);
            const data = await response.json();
            return this.validateResponse(response, data);
        } catch (error) {
            console.error('Error fetching upcoming movies:', error);
            return { error: error.message, results: [] };
        }
    }

    // Search movies
    static async searchMovies(query, page = 1) {
        try {
            if (!this.isApiKeyConfigured()) {
                throw new Error('API key not configured. Please add your TMDB API key in js/api.js');
            }
            if (!query || query.trim() === '') {
                return { results: [], total_results: 0 };
            }
            const response = await fetch(`${API_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
            const data = await response.json();
            return this.validateResponse(response, data);
        } catch (error) {
            console.error('Error searching movies:', error);
            return { error: error.message, results: [] };
        }
    }

    // Get movie details
    static async getMovieDetails(movieId) {
        try {
            if (!this.isApiKeyConfigured()) {
                throw new Error('API key not configured. Please add your TMDB API key in js/api.js');
            }
            const response = await fetch(`${API_BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
            const data = await response.json();
            return this.validateResponse(response, data);
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    }

    // Get movie videos (trailers) - automatically fetched with details
    static async getMovieVideos(movieId) {
        try {
            if (!this.isApiKeyConfigured()) {
                throw new Error('API key not configured. Please add your TMDB API key in js/api.js');
            }
            const response = await fetch(`${API_BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
            const data = await response.json();
            return this.validateResponse(response, data);
        } catch (error) {
            console.error('Error fetching movie videos:', error);
            return { results: [] };
        }
    }

    // Get movie details with videos automatically
    static async getMovieWithTrailer(movieId) {
        try {
            const [movieDetails, videos] = await Promise.all([
                this.getMovieDetails(movieId),
                this.getMovieVideos(movieId)
            ]);

            if (movieDetails) {
                movieDetails.trailers = this.getAllTrailers(videos);
                movieDetails.mainTrailer = this.getTrailerUrl(videos);
                movieDetails.allVideos = videos.results || [];
            }

            return movieDetails;
        } catch (error) {
            console.error('Error fetching movie with trailer:', error);
            return null;
        }
    }

    // Get image URL
    static getImageUrl(path, size = 'w500') {
        if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
        return `https://image.tmdb.org/t/p/${size}${path}`;
    }

    // Get poster URL (larger)
    static getPosterUrl(path) {
        return this.getImageUrl(path, 'w780');
    }

    // Get backdrop URL
    static getBackdropUrl(path) {
        if (!path) return null;
        return `https://image.tmdb.org/t/p/w1280${path}`;
    }

    // Get main trailer URL (embed)
    static getTrailerUrl(videos) {
        if (!videos || !videos.results || videos.results.length === 0) return null;
        // First try to find official trailer
        let trailer = videos.results.find(video =>
            video.type === 'Trailer' &&
            video.site === 'YouTube' &&
            (video.official === true || video.name.toLowerCase().includes('official'))
        );
        // If no official, get any trailer
        if (!trailer) {
            trailer = videos.results.find(video =>
                video.type === 'Trailer' && video.site === 'YouTube'
            );
        }
        if (trailer) {
            return `${YOUTUBE_BASE_URL}${trailer.key}?autoplay=1&rel=0`;
        }
        return null;
    }

    // Get all trailers
    static getAllTrailers(videos) {
        if (!videos || !videos.results || videos.results.length === 0) return [];
        return videos.results
            .filter(video => video.type === 'Trailer' && video.site === 'YouTube')
            .map(video => ({
                key: video.key,
                name: video.name,
                embedUrl: `${YOUTUBE_BASE_URL}${video.key}`,
                watchUrl: `${YOUTUBE_WATCH_URL}${video.key}`,
                official: video.official || false
            }));
    }

    // Get watch URL for trailer
    static getTrailerWatchUrl(videos) {
        const trailerUrl = this.getTrailerUrl(videos);
        if (!trailerUrl) return null;
        const videoKey = trailerUrl.split('/embed/')[1]?.split('?')[0];
        return videoKey ? `${YOUTUBE_WATCH_URL}${videoKey}` : null;
    }

    // Get full movie embed URL
    static getMovieEmbedUrl(movieId) {
        if (!movieId) return null;
        return `${MOVIE_EMBED_BASE_URL}${movieId}`;
    }
}

