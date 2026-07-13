// Movie detail page functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication status first and cache it
    if (typeof checkAuthStatus === 'function') {
        window.isUserLoggedIn = await checkAuthStatus();
    } else {
        window.isUserLoggedIn = false;
    }

    // Get movie ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (movieId) {
        await loadMovieDetails(movieId);
    } else {
        showError('No movie ID provided.');
    }

    // Stop all videos when page is about to unload
    window.addEventListener('beforeunload', stopAllVideos);

    // Stop videos when page becomes hidden (tab switch, minimize, etc.)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAllVideos();
        }
    });
});

// Stop all videos on the page
function stopAllVideos() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        if (iframe.src && iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be')) {
            iframe.src = ''; // Stop playback
        }
    });
}

// Load movie details - automatically loads movie and video
async function loadMovieDetails(movieId) {
    const container = document.getElementById('movieDetailContainer');

    if (!container) return;

    // Automatically fetch movie details with video
    const movieData = await MovieAPI.getMovieWithTrailer(movieId);

    if (movieData) {
        try {
            const safeMovieTitle = (movieData.title || 'Movie').replace(/'/g, "\\'");

            const trailerUrl = movieData.mainTrailer;
            const fullMovieUrl = MovieAPI.getMovieEmbedUrl(movieId);

            const allTrailers = movieData.trailers || [];
            const allVideos = movieData.allVideos || [];

            // Determine initial mode and URL
            let initialMode = 'movie';
            let mainUrl = fullMovieUrl;

            // Fallback to trailer if no full movie URL
            if (!fullMovieUrl && trailerUrl) {
                initialMode = 'trailer';
                mainUrl = trailerUrl;
            }

            // Store movie URL globally for play function
            window.mainMovieUrl = mainUrl;
            window.fullMovieUrl = fullMovieUrl;
            window.trailerUrl = trailerUrl;
            window.currentVideoMode = initialMode;

            container.innerHTML = `
            <div class="row">
                <div class="col-md-4 mb-4">
                    <img src="${MovieAPI.getImageUrl(movieData.poster_path)}" 
                         class="img-fluid rounded shadow" 
                         alt="${movieData.title}"
                         onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'">
                    ${trailerUrl ? `
                        <div class="mt-3 text-center">
                            <button type="button" class="btn btn-danger btn-lg w-100" id="watchMovieBtn" onclick="playMainMovieWithAuth(event)">
                                <i class="bi bi-play-circle-fill"></i> Watch Now
                            </button>
                            <small class="text-muted d-block mt-2">Full Movie & Trailer Available</small>
                        </div>
                    ` : ''}
                </div>
                <div class="col-md-8">
                    <h1 class="mb-3">${movieData.title}</h1>
                    <div class="mb-3">
                        <span class="badge bg-primary me-2">
                            <i class="bi bi-calendar"></i> ${movieData.release_date || 'N/A'}
                        </span>
                        <span class="badge bg-warning text-dark me-2">
                            <i class="bi bi-star-fill"></i> ${movieData.vote_average ? movieData.vote_average.toFixed(1) : 'N/A'}/10
                        </span>
                        <span class="badge bg-info me-2">
                            <i class="bi bi-clock"></i> ${movieData.runtime || 'N/A'} min
                        </span>
                        ${movieData.genres && movieData.genres.length > 0 ? `
                            ${movieData.genres.map(genre => `
                                <span class="badge bg-secondary me-2">${genre.name}</span>
                            `).join('')}
                        ` : ''}
                    </div>
                    <h4 class="mt-4 mb-3">Overview</h4>
                    <p class="lead">${movieData.overview || 'No overview available.'}</p>
                    
                    ${movieData.tagline ? `
                        <p class="text-muted fst-italic">"${movieData.tagline}"</p>
                    ` : ''}
                    
                    <div class="mt-4">
                        <h5>Details</h5>
                        <ul class="list-unstyled">
                            ${movieData.production_companies && movieData.production_companies.length > 0 ? `
                                <li><strong>Production:</strong> ${movieData.production_companies.map(company => company.name).join(', ')}</li>
                            ` : ''}
                            ${movieData.production_countries && movieData.production_countries.length > 0 ? `
                                <li><strong>Country:</strong> ${movieData.production_countries.map(country => country.name).join(', ')}</li>
                            ` : ''}
                            ${movieData.spoken_languages && movieData.spoken_languages.length > 0 ? `
                                <li><strong>Language:</strong> ${movieData.spoken_languages.map(lang => lang.name).join(', ')}</li>
                            ` : ''}
                            ${movieData.budget ? `
                                <li><strong>Budget:</strong> $${movieData.budget.toLocaleString()}</li>
                            ` : ''}
                            ${movieData.revenue ? `
                                <li><strong>Revenue:</strong> $${movieData.revenue.toLocaleString()}</li>
                            ` : ''}
                        </ul>
                    </div>
                    
                    <div class="mt-4">
                        <button class="btn btn-success btn-lg me-2" onclick="addToMyList(${movieId})">
                            <i class="bi bi-plus-circle"></i> Add to My List
                        </button>
                        <a href="movies.php" class="btn btn-outline-primary btn-lg">
                            <i class="bi bi-arrow-left"></i> Back to Movies
                        </a>
                        <div class="btn-group mt-3" role="group">
                            ${window.isUserLoggedIn ? `
                            <button class="btn btn-outline-info" onclick="downloadMovie(${movieId}, '${safeMovieTitle}')">
                                <i class="bi bi-download"></i> Download Full Movie
                            </button>
                            <button class="btn btn-outline-info" onclick="downloadTrailer(${movieId}, '${safeMovieTitle}')">
                                <i class="bi bi-download"></i> Download Video
                            </button>
                            ` : `
                            <button class="btn btn-outline-secondary" onclick="showLoginPrompt('Please login to download movies')">
                                <i class="bi bi-lock"></i> Movie Download
                            </button>
                            <button class="btn btn-outline-secondary" onclick="showLoginPrompt('Please login to download videos')">
                                <i class="bi bi-lock"></i> Video Download
                            </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
            
            ${trailerUrl ? `
                <div class="row mt-5">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h3 class="mb-0" id="videoModeTitle">${initialMode === 'movie' ? 'Watch Full Movie' : 'Watch Trailer'}</h3>
                            <div class="btn-group" role="group" aria-label="Video mode toggle">
                                <button type="button" class="btn ${initialMode === 'movie' ? 'btn-primary active' : 'btn-outline-primary'}" id="fullMovieBtn" onclick="switchVideoMode('movie')">
                                    <i class="bi bi-film"></i> Full Movie
                                </button>
                                <button type="button" class="btn ${initialMode === 'trailer' ? 'btn-primary active' : 'btn-outline-primary'}" id="trailerBtn" onclick="switchVideoMode('trailer')">
                                    <i class="bi bi-play-circle"></i> Trailer Only
                                </button>
                            </div>
                        </div>
                        <div id="movieContainer" class="ratio ratio-16x9" style="position: relative; width: 100%; padding-bottom: 56.25%; background: #000;">
                            <div id="moviePlaceholder" class="d-flex align-items-center justify-content-center bg-dark text-white" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                                <div class="text-center">
                                    <i class="bi bi-play-circle" style="font-size: 3rem; color: var(--primary-color);"></i>
                                    <p class="mt-3" id="loadingText">Loading movie...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ` : '<div class="alert alert-warning mt-4"><i class="bi bi-exclamation-triangle"></i> No video available for this movie.</div>'}
            
            ${allTrailers.length > 1 ? `
                <div class="row mt-4">
                    <div class="col-12">
                        <h4 class="mb-3">Related Videos</h4>
                        <div class="row g-3">
                            ${allTrailers.slice(1, 4).map(trailer => `
                                <div class="col-md-4">
                                    <div class="card h-100">
                                        <div class="ratio ratio-16x9" style="position: relative; width: 100%; padding-bottom: 56.25%; background: #000;">
                                            <iframe src="${trailer.embedUrl}" 
                                                    allow="autoplay; encrypted-media; picture-in-picture" 
                                                    allowfullscreen
                                                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; display: block;"></iframe>
                                        </div>
                                        <div class="card-body">
                                            <h6 class="card-title">${trailer.name}</h6>
                                            ${trailer.official ? '<span class="badge bg-primary">Official</span>' : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            ` : ''}
            
            ${allVideos.length > 0 && allVideos.filter(v => v.type !== 'Trailer').length > 0 ? `
                <div class="row mt-5">
                    <div class="col-12">
                        <h3 class="mb-3">Other Videos</h3>
                        <div class="row g-3">
                            ${allVideos.filter(v => v.type !== 'Trailer' && v.site === 'YouTube').slice(0, 6).map(video => `
                                <div class="col-md-6 col-lg-4">
                                    <div class="card">
                                        <div class="ratio ratio-16x9" style="position: relative; width: 100%; padding-bottom: 56.25%; background: #000;">
                                            <iframe src="https://www.youtube.com/embed/${video.key}" 
                                                    allow="autoplay; encrypted-media; picture-in-picture" 
                                                    allowfullscreen
                                                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; display: block;"></iframe>
                                        </div>
                                        <div class="card-body">
                                            <h6 class="card-title">${video.name}</h6>
                                            <small class="text-muted">${video.type}</small>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            ` : ''}
        `;

        } catch (e) {
            console.error('Error updating container content:', e);
            container.innerHTML = `<div class="alert alert-danger">Error rendering movie details: ${e.message}</div>`;
        }

        // Check auth and auto-load movie if user is logged in
        setTimeout(() => {
            checkAuthAndLoadMovie();
        }, 300);
    } else {
        showError('Failed to load movie details. Please try again later.');
    }
}

// Play main movie function with auth check
async function playMainMovieWithAuth(event) {
    if (event) event.preventDefault();

    // Check authentication - use cached value if available
    let isLoggedIn = false;
    if (window.isUserLoggedIn !== undefined) {
        isLoggedIn = window.isUserLoggedIn;
    } else if (typeof checkAuthStatus === 'function') {
        isLoggedIn = await checkAuthStatus();
        window.isUserLoggedIn = isLoggedIn;
    }

    if (!isLoggedIn) {
        if (typeof showLoginPrompt === 'function') {
            showLoginPrompt('Please login to watch full movies');
        }
        return;
    }

    // User is logged in, load movie
    const movieContainer = document.getElementById('movieContainer');
    const placeholder = document.getElementById('moviePlaceholder');

    if (movieContainer && placeholder && window.mainMovieUrl) {
        placeholder.remove();
        movieContainer.innerHTML = `
            <iframe id="mainMovie" 
                    src="${window.mainMovieUrl}" 
                    allow="autoplay; encrypted-media; picture-in-picture" 
                    allowfullscreen
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; display: block;"></iframe>
        `;
        movieContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Play main movie function (legacy)
function playMainTrailer() {
    playMainMovieWithAuth();
}

// Check auth and load movie on page load - automatically show movies when logged in
// This runs after loadMovieDetails completes
async function checkAuthAndLoadMovie() {
    // Use cached auth status if available
    let isLoggedIn = false;
    if (window.isUserLoggedIn !== undefined) {
        isLoggedIn = window.isUserLoggedIn;
    } else if (typeof checkAuthStatus === 'function') {
        isLoggedIn = await checkAuthStatus();
        window.isUserLoggedIn = isLoggedIn;
    }

    if (isLoggedIn && window.mainMovieUrl) {
        // User is logged in, automatically show movie
        const placeholder = document.getElementById('moviePlaceholder');
        const movieContainer = document.getElementById('movieContainer');
        if (placeholder && movieContainer) {
            placeholder.remove();
            movieContainer.innerHTML = `
                <iframe id="mainMovie" 
                        src="${window.mainMovieUrl}?autoplay=0&rel=0" 
                        allow="autoplay; encrypted-media; picture-in-picture" 
                        allowfullscreen
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; display: block;"></iframe>
            `;
            // Scroll to movie after a short delay to ensure it's loaded
            setTimeout(() => {
                movieContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    } else if (!isLoggedIn) {
        // User not logged in - ensure login prompt is visible
        const placeholder = document.getElementById('moviePlaceholder');
        if (placeholder) {
            placeholder.innerHTML = `
                <div class="text-center">
                    <i class="bi bi-lock" style="font-size: 3rem; color: var(--primary-color);"></i>
                    <p class="mt-3">Please login to watch full movies</p>
                    <a href="login.php" class="btn btn-primary mt-2">Login</a>
                </div>
            `;
        }
    }
}

// Add movie to my list
function addToMyList(movieId) {
    const myList = getMyList();

    if (!myList.includes(movieId)) {
        myList.push(movieId);
        saveMyList(myList);
        showNotification('Movie added to your list!', 'success');
    } else {
        showNotification('Movie is already in your list!', 'info');
    }
}

// Get my list from localStorage
function getMyList() {
    const list = localStorage.getItem('myMovieList');
    return list ? JSON.parse(list) : [];
}

// Save my list to localStorage
function saveMyList(list) {
    localStorage.setItem('myMovieList', JSON.stringify(list));
}

// Show error message
function showError(message) {
    const container = document.getElementById('movieDetailContainer');
    if (container) {
        container.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error!</h4>
                <p>${message}</p>
                <hr>
                <a href="movies.php" class="btn btn-primary">Go to Movies</a>
            </div>
        `;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

