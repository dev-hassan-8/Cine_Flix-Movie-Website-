// Main page functionality
let heroMovieTimers = {}; // Store timers for each movie
let isUserLoggedIn = false; // Track login status

// Display success/error messages from URL parameters
(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success) {
        const successAlert = document.getElementById('successAlert');
        const successMessage = document.getElementById('successMessage');
        if (successAlert && successMessage) {
            successMessage.textContent = decodeURIComponent(success);
            successAlert.classList.remove('d-none');
            // Auto-hide after 5 seconds
            setTimeout(() => {
                successAlert.classList.add('d-none');
            }, 5000);
        }
    }

    if (error) {
        // Create error alert if needed
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger alert-dismissible fade show mt-3';
        errorAlert.innerHTML = `
            <i class="bi bi-exclamation-triangle"></i> <span>${decodeURIComponent(error)}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        const heroContent = document.querySelector('.hero-content .container');
        if (heroContent) {
            heroContent.appendChild(errorAlert);
        }
    }
})();

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication status first
    if (typeof checkAuthStatus === 'function') {
        isUserLoggedIn = await checkAuthStatus();
        // Update global auth status for all functions
        window.isUserLoggedIn = isUserLoggedIn;
    } else {
        isUserLoggedIn = false;
        window.isUserLoggedIn = false;
    }

    // Check if API key is configured
    if (!MovieAPI.isApiKeyConfigured()) {
        // Show API key warning
        const apiWarning = document.getElementById('apiWarning');
        if (apiWarning) {
            apiWarning.style.display = 'block';
        }
        // Show message in featured movies section
        const container = document.getElementById('featuredMovies');
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning text-center" role="alert">
                        <h4><i class="bi bi-exclamation-triangle"></i> API Key Required</h4>
                        <p>You need to add your TMDB API key to use this website.</p>
                        <p><strong>Don't worry - it's 100% FREE and takes less than 5 minutes!</strong></p>
                        <a href="api-setup.html" class="btn btn-primary btn-lg mt-3">
                            <i class="bi bi-key"></i> Get Your FREE API Key Now
                        </a>
                        <p class="mt-3 mb-0"><small>Or check the <code>GET_API_KEY.md</code> file for step-by-step instructions</small></p>
                    </div>
                </div>
            `;
        }
        return;
    }

    // Load featured movies on homepage
    await loadFeaturedMovies();

    // Load hero movies
    await loadHeroMovies();

    // Load all movie sections
    await loadAllMovieSections();

    // Re-check auth status after a short delay to ensure it's updated
    setTimeout(async () => {
        if (typeof checkAuthStatus === 'function') {
            const currentAuthStatus = await checkAuthStatus();
            isUserLoggedIn = currentAuthStatus;
            window.isUserLoggedIn = currentAuthStatus;

            // If user is logged in, enable all trailer access
            if (currentAuthStatus && typeof enableTrailerAccess === 'function') {
                enableTrailerAccess();
            }
        }
    }, 500);
});

// Load all movie sections
async function loadAllMovieSections() {
    // Load sections in parallel for better performance
    await Promise.all([
        loadTopRatedMovies(),
        loadNowPlayingMovies(),
        loadUpcomingMovies(),
        loadMustWatchMovies(),
        loadFanFavoritesMovies(),
        loadCriticsChoiceMovies(),
        loadTrendingNowMovies()
    ]);
}

// Load Top Rated Movies
async function loadTopRatedMovies() {
    const container = document.getElementById('topRatedMovies');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

    // Change container to horizontal scroll
    container.className = 'movie-scroll-container';

    const data = await MovieAPI.getTopRatedMovies(1);

    if (data && data.results && data.results.length > 0) {
        container.innerHTML = '';
        // Filter out unwanted movies
        let filteredMovies = filterMovies(data.results);

        // Get more movies from multiple pages to have 20+ movies
        if (filteredMovies.length < 20 && data.total_pages > 1) {
            for (let page = 2; page <= Math.min(3, data.total_pages) && filteredMovies.length < 20; page++) {
                const nextPageData = await MovieAPI.getTopRatedMovies(page);
                if (nextPageData && nextPageData.results) {
                    const additionalMovies = filterMovies(nextPageData.results);
                    filteredMovies = [...filteredMovies, ...additionalMovies];
                }
            }
        }

        const movies = filteredMovies.slice(0, 20); // Show 20 movies for scrolling

        for (const movie of movies) {
            const movieCard = await createMovieCardForScroll(movie);
            container.appendChild(movieCard);
        }
    } else {
        container.innerHTML = '<div class="text-center py-5"><p>Failed to load top rated movies.</p></div>';
    }
}

// Load Now Playing Movies
async function loadNowPlayingMovies() {
    const container = document.getElementById('nowPlayingMovies');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

    // Change container to horizontal scroll
    container.className = 'movie-scroll-container';

    const data = await MovieAPI.getNowPlayingMovies(1);

    if (data && data.results && data.results.length > 0) {
        container.innerHTML = '';
        // Filter out unwanted movies
        let filteredMovies = filterMovies(data.results);

        // Get more movies from multiple pages to have 20+ movies
        if (filteredMovies.length < 20 && data.total_pages > 1) {
            for (let page = 2; page <= Math.min(3, data.total_pages) && filteredMovies.length < 20; page++) {
                const nextPageData = await MovieAPI.getNowPlayingMovies(page);
                if (nextPageData && nextPageData.results) {
                    const additionalMovies = filterMovies(nextPageData.results);
                    filteredMovies = [...filteredMovies, ...additionalMovies];
                }
            }
        }

        const movies = filteredMovies.slice(0, 20); // Show 20 movies for scrolling

        for (const movie of movies) {
            const movieCard = await createMovieCardForScroll(movie);
            container.appendChild(movieCard);
        }
    } else {
        container.innerHTML = '<div class="text-center py-5"><p>Failed to load now playing movies.</p></div>';
    }
}

// Load Upcoming Movies
async function loadUpcomingMovies() {
    const container = document.getElementById('upcomingMovies');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

    // Change container to horizontal scroll
    container.className = 'movie-scroll-container';

    const data = await MovieAPI.getUpcomingMovies(1);

    if (data && data.results && data.results.length > 0) {
        container.innerHTML = '';
        // Filter out unwanted movies
        let filteredMovies = filterMovies(data.results);

        // Get more movies from multiple pages to have 20+ movies
        if (filteredMovies.length < 20 && data.total_pages > 1) {
            for (let page = 2; page <= Math.min(3, data.total_pages) && filteredMovies.length < 20; page++) {
                const nextPageData = await MovieAPI.getUpcomingMovies(page);
                if (nextPageData && nextPageData.results) {
                    const additionalMovies = filterMovies(nextPageData.results);
                    filteredMovies = [...filteredMovies, ...additionalMovies];
                }
            }
        }

        const movies = filteredMovies.slice(0, 20); // Show 20 movies for scrolling

        for (const movie of movies) {
            const movieCard = await createMovieCardForScroll(movie);
            container.appendChild(movieCard);
        }
    } else {
        container.innerHTML = '<div class="text-center py-5"><p>Failed to load upcoming movies.</p></div>';
    }
}

// Load Must Watch Movies (Top Rated Page 2)
async function loadMustWatchMovies() {
    const container = document.getElementById('mustWatchMovies');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

    // Change container to horizontal scroll
    container.className = 'movie-scroll-container';

    const data = await MovieAPI.getTopRatedMovies(2);

    if (data && data.results && data.results.length > 0) {
        container.innerHTML = '';
        // Filter out unwanted movies
        let filteredMovies = filterMovies(data.results);

        // Get more movies from multiple pages to have 20+ movies
        if (filteredMovies.length < 20 && data.total_pages > 2) {
            for (let page = 3; page <= Math.min(4, data.total_pages) && filteredMovies.length < 20; page++) {
                const nextPageData = await MovieAPI.getTopRatedMovies(page);
                if (nextPageData && nextPageData.results) {
                    const additionalMovies = filterMovies(nextPageData.results);
                    filteredMovies = [...filteredMovies, ...additionalMovies];
                }
            }
        }

        const movies = filteredMovies.slice(0, 20);

        for (const movie of movies) {
            const movieCard = await createMovieCardForScroll(movie);
            container.appendChild(movieCard);
        }
    } else {
        container.innerHTML = '<div class="text-center py-5"><p>Failed to load must watch movies.</p></div>';
    }
}

// Load Fan Favorites Movies (Popular Page 2)
async function loadFanFavoritesMovies() {
    const container = document.getElementById('fanFavoritesMovies');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

    // Change container to horizontal scroll
    container.className = 'movie-scroll-container';

    const data = await MovieAPI.getPopularMovies(2);

    if (data && data.results && data.results.length > 0) {
        container.innerHTML = '';
        // Filter out unwanted movies
        let filteredMovies = filterMovies(data.results);

        // Get more movies from multiple pages to have 20+ movies
        if (filteredMovies.length < 20 && data.total_pages > 2) {
            for (let page = 3; page <= Math.min(4, data.total_pages) && filteredMovies.length < 20; page++) {
                const nextPageData = await MovieAPI.getPopularMovies(page);
                if (nextPageData && nextPageData.results) {
                    const additionalMovies = filterMovies(nextPageData.results);
                    filteredMovies = [...filteredMovies, ...additionalMovies];
                }
            }
        }

        const movies = filteredMovies.slice(0, 20);

        for (const movie of movies) {
            const movieCard = await createMovieCardForScroll(movie);
            container.appendChild(movieCard);
        }
    } else {
        container.innerHTML = '<div class="text-center py-5"><p>Failed to load fan favorites.</p></div>';
    }
}

// Load Critics' Choice Movies (Top Rated Page 3)
async function loadCriticsChoiceMovies() {
    const container = document.getElementById('criticsChoiceMovies');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

    // Change container to horizontal scroll
    container.className = 'movie-scroll-container';

    const data = await MovieAPI.getTopRatedMovies(3);

    if (data && data.results && data.results.length > 0) {
        container.innerHTML = '';
        // Filter out unwanted movies
        let filteredMovies = filterMovies(data.results);

        // Get more movies from multiple pages to have 20+ movies
        if (filteredMovies.length < 20 && data.total_pages > 3) {
            for (let page = 4; page <= Math.min(5, data.total_pages) && filteredMovies.length < 20; page++) {
                const nextPageData = await MovieAPI.getTopRatedMovies(page);
                if (nextPageData && nextPageData.results) {
                    const additionalMovies = filterMovies(nextPageData.results);
                    filteredMovies = [...filteredMovies, ...additionalMovies];
                }
            }
        }

        const movies = filteredMovies.slice(0, 20);

        for (const movie of movies) {
            const movieCard = await createMovieCardForScroll(movie);
            container.appendChild(movieCard);
        }
    } else {
        container.innerHTML = '<div class="text-center py-5"><p>Failed to load critics choice movies.</p></div>';
    }
}

// Load Trending Now Movies (Now Playing Page 2)
async function loadTrendingNowMovies() {
    const container = document.getElementById('trendingNowMovies');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

    // Change container to horizontal scroll
    container.className = 'movie-scroll-container';

    const data = await MovieAPI.getNowPlayingMovies(2);

    if (data && data.results && data.results.length > 0) {
        container.innerHTML = '';
        // Filter out unwanted movies
        let filteredMovies = filterMovies(data.results);

        // Get more movies from multiple pages to have 20+ movies
        if (filteredMovies.length < 20 && data.total_pages > 2) {
            for (let page = 3; page <= Math.min(4, data.total_pages) && filteredMovies.length < 20; page++) {
                const nextPageData = await MovieAPI.getNowPlayingMovies(page);
                if (nextPageData && nextPageData.results) {
                    const additionalMovies = filterMovies(nextPageData.results);
                    filteredMovies = [...filteredMovies, ...additionalMovies];
                }
            }
        }

        const movies = filteredMovies.slice(0, 20);

        for (const movie of movies) {
            const movieCard = await createMovieCardForScroll(movie);
            container.appendChild(movieCard);
        }
    } else {
        container.innerHTML = '<div class="text-center py-5"><p>Failed to load trending movies.</p></div>';
    }
}

// Filter out unwanted movies
function filterMovies(movies) {
    return movies.filter(movie => {
        const title = movie.title ? movie.title.toLowerCase() : '';
        // Filter out BUREAU 749
        return !title.includes('bureau 749') && !title.includes('bureau749');
    });
}

// Load hero movies with auto-trailer feature
async function loadHeroMovies() {
    const container = document.getElementById('heroMovies');
    if (!container) return;

    container.innerHTML = '<div class="text-center text-white"><div class="spinner-border text-primary" role="status"></div></div>';

    const data = await MovieAPI.getPopularMovies(1);

    if (data && data.results && data.results.length > 0) {
        container.innerHTML = '';
        // Filter out unwanted movies
        let filteredMovies = filterMovies(data.results);

        // If we filtered out movies, get more from the next page
        if (filteredMovies.length < 4 && data.total_pages > 1) {
            const nextPageData = await MovieAPI.getPopularMovies(2);
            if (nextPageData && nextPageData.results) {
                const additionalMovies = filterMovies(nextPageData.results);
                filteredMovies = [...filteredMovies, ...additionalMovies];
            }
        }

        const movies = filteredMovies.slice(0, 4); // Show 4 movies in hero

        // Create hero movie items
        movies.forEach((movie, index) => {
            const heroMovie = createHeroMovieItem(movie);
            container.appendChild(heroMovie);
        });
    } else {
        container.innerHTML = '';
    }
}

// Create hero movie item with auto-trailer
function createHeroMovieItem(movie) {
    const item = document.createElement('div');
    item.className = 'hero-movie-item';
    item.dataset.movieId = movie.id;
    item.dataset.movieTitle = movie.title;

    item.innerHTML = `
        <img src="${MovieAPI.getImageUrl(movie.poster_path)}" 
             class="hero-movie-poster" 
             alt="${movie.title}"
             onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'">
        <div class="hero-movie-trailer"></div>
        <div class="hero-movie-play-indicator">
            <i class="bi bi-play-fill"></i>
        </div>
        <div class="hero-movie-loading">
            <i class="bi bi-hourglass-split"></i> Loading trailer...
        </div>
        <div class="trailer-countdown"></div>
        <div class="hero-movie-info">
            <h6 class="hero-movie-title">${movie.title}</h6>
            <div class="hero-movie-rating">
                <i class="bi bi-star-fill"></i>
                <span>${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
            </div>
        </div>
    `;

    // Add hover event listeners for auto-trailer
    let hoverTimer = null;
    let countdownTimer = null;
    let countdown = 7; // 7 seconds countdown

    item.addEventListener('mouseenter', async () => {
        // Check if user is logged in before allowing trailer
        let loggedIn = false;

        // Use cached auth status if available
        if (window.isUserLoggedIn !== undefined) {
            loggedIn = window.isUserLoggedIn;
        } else if (typeof checkAuthStatus === 'function') {
            loggedIn = await checkAuthStatus();
            // Cache the result
            window.isUserLoggedIn = loggedIn;
            isUserLoggedIn = loggedIn;
        } else {
            // If checkAuthStatus is not available, assume logged in (for backward compatibility)
            loggedIn = true;
        }

        if (!loggedIn) {
            // Show login prompt instead of trailer
            item.classList.add('login-required');
            const trailerDiv = item.querySelector('.hero-movie-trailer');
            if (trailerDiv) {
                trailerDiv.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: rgba(0,0,0,0.9); color: white; text-align: center; padding: 20px; cursor: pointer;" onclick="showLoginPrompt('Please login to watch trailers')">
                        <div>
                            <i class="bi bi-lock" style="font-size: 2rem; color: var(--primary-color);"></i>
                            <p style="margin-top: 10px; font-size: 0.9rem;">Login to watch trailer</p>
                            <button class="btn btn-sm btn-primary mt-2">Login</button>
                        </div>
                    </div>
                `;
                item.classList.add('playing-trailer');
            }
            return;
        }

        // User is logged in - proceed with trailer
        // Start countdown
        countdown = 7;
        item.classList.add('countdown-active');
        updateCountdown(item, countdown);

        countdownTimer = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                updateCountdown(item, countdown);
            } else {
                clearInterval(countdownTimer);
                item.classList.remove('countdown-active');
                // Start loading trailer
                loadHeroTrailer(movie.id, item);
            }
        }, 1000);
    });

    item.addEventListener('mouseleave', () => {
        // Clear timers
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }

        // Stop trailer if playing
        const trailerDiv = item.querySelector('.hero-movie-trailer');
        if (trailerDiv) {
            const iframe = trailerDiv.querySelector('iframe');
            if (iframe) {
                // Stop trailer by removing src
                iframe.src = '';
            }
            trailerDiv.innerHTML = '';
        }

        // Reset movie item
        item.classList.remove('countdown-active', 'loading-trailer', 'playing-trailer');
        const countdownEl = item.querySelector('.trailer-countdown');
        if (countdownEl) {
            countdownEl.textContent = '';
        }
    });

    // Click to view details
    item.addEventListener('click', () => {
        viewMovieDetails(movie.id);
    });

    return item;
}

// Update countdown display
function updateCountdown(item, seconds) {
    const countdownEl = item.querySelector('.trailer-countdown');
    if (countdownEl) {
        countdownEl.textContent = `Trailer in ${seconds}s`;
    }
}

// Load trailer for hero movie
async function loadHeroTrailer(movieId, item) {
    item.classList.add('loading-trailer');

    // Fetch movie videos
    const videos = await MovieAPI.getMovieVideos(movieId);
    const trailerUrl = MovieAPI.getTrailerUrl(videos);

    if (trailerUrl) {
        const trailerDiv = item.querySelector('.hero-movie-trailer');
        if (trailerDiv) {
            // Use autoplay but with mute for better UX
            const embedUrl = trailerUrl.replace('?autoplay=1&rel=0', '?autoplay=1&mute=1&rel=0&controls=1');
            const iframeId = `heroTrailer_${movieId}_${Date.now()}`;
            trailerDiv.innerHTML = `
                <iframe 
                    id="${iframeId}"
                    src="${embedUrl}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    style="width: 100%; height: 100%;">
                </iframe>
            `;

            // Store iframe reference for cleanup
            const iframe = document.getElementById(iframeId);

            // Show trailer after a brief delay
            setTimeout(() => {
                item.classList.remove('loading-trailer');
                item.classList.add('playing-trailer');
            }, 300);

            // Add cleanup function to item
            item._stopTrailer = function () {
                if (iframe) {
                    iframe.src = '';
                }
            };
        }
    } else {
        item.classList.remove('loading-trailer');
        // Show message that no trailer is available
        const trailerDiv = item.querySelector('.hero-movie-trailer');
        if (trailerDiv) {
            trailerDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: rgba(0,0,0,0.8); color: white; text-align: center; padding: 20px;">
                    <div>
                        <i class="bi bi-exclamation-circle" style="font-size: 2rem; color: var(--primary-color);"></i>
                        <p style="margin-top: 10px; font-size: 0.9rem;">No trailer available</p>
                    </div>
                </div>
            `;
            item.classList.add('playing-trailer');
        }
    }
}

// Load featured movies (popular movies) - automatically loads on page load
async function loadFeaturedMovies() {
    const container = document.getElementById('featuredMovies');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Loading movies...</p></div>';

    // Change container to horizontal scroll
    container.className = 'movie-scroll-container';

    const data = await MovieAPI.getPopularMovies(1);

    // Check for API errors
    if (data && data.error) {
        container.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h5><i class="bi bi-exclamation-triangle"></i> API Error</h5>
                <p>${data.error}</p>
                ${data.error.includes('API key') ? `
                    <p class="mb-0"><small>Please add your TMDB API key in <code>js/api.js</code></small></p>
                ` : ''}
            </div>
        `;
        return;
    }

    if (data && data.results && data.results.length > 0) {
        container.innerHTML = '';
        // Filter out unwanted movies
        let filteredMovies = filterMovies(data.results);

        // Skip first 4 (used in hero) and get more movies for scrolling
        filteredMovies = filteredMovies.slice(4);

        // Get more movies from multiple pages to have 20+ movies
        if (filteredMovies.length < 20 && data.total_pages > 1) {
            for (let page = 2; page <= Math.min(3, data.total_pages) && filteredMovies.length < 20; page++) {
                const nextPageData = await MovieAPI.getPopularMovies(page);
                if (nextPageData && nextPageData.results) {
                    const additionalMovies = filterMovies(nextPageData.results);
                    filteredMovies = [...filteredMovies, ...additionalMovies];
                }
            }
        }

        const movies = filteredMovies.slice(0, 20); // Show 20 movies for scrolling

        // Automatically display movies with animation
        for (const movie of movies) {
            const movieCard = await createMovieCardForScroll(movie);
            container.appendChild(movieCard);
            // Animation is handled by CSS with staggered delays
        }
    } else {
        container.innerHTML = '<div class="text-center py-5"><p>Failed to load movies. Please check your API key.</p></div>';
    }
}

// Create movie card element for horizontal scroll
async function createMovieCardForScroll(movie) {
    // Check if user is logged in - use cached value if available
    let userLoggedIn = isUserLoggedIn;
    if (typeof checkAuthStatus === 'function') {
        if (window.isUserLoggedIn !== undefined) {
            userLoggedIn = window.isUserLoggedIn;
        } else {
            userLoggedIn = await checkAuthStatus();
            isUserLoggedIn = userLoggedIn;
            window.isUserLoggedIn = userLoggedIn;
        }
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'movie-card-wrapper';
    const safeTitle = (movie.title || 'Movie').replace(/'/g, "\\'");

    wrapper.innerHTML = `
        <div class="card movie-card h-100">
            <div class="position-relative">
                <img src="${MovieAPI.getImageUrl(movie.poster_path)}" 
                     class="card-img-top" 
                     alt="${movie.title}"
                     onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'">
            </div>
            <div class="card-body">
                <h5 class="card-title">${movie.title}</h5>
                <p class="card-text mb-2">
                    <span class="text-muted me-2">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                    <i class="bi bi-star-fill text-warning"></i>
                    <span class="text-muted ms-1">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                </p>
                <div class="d-grid gap-2">
                    <button class="btn btn-primary btn-sm" onclick="viewMovieDetails(${movie.id})">
                        <i class="bi bi-info-circle"></i> View Details
                    </button>
                    <div class="btn-group" role="group">
                        ${userLoggedIn ? `
                        <button class="btn btn-outline-warning btn-sm" onclick="watchMovieWithAuth(${movie.id}, '${safeTitle}')" title="Watch Full Movie">
                            <i class="bi bi-play-fill"></i> Watch
                        </button>
                        <button class="btn btn-outline-primary btn-sm" onclick="watchTrailerWithAuth(${movie.id}, '${safeTitle}')" title="Watch Trailer">
                            <i class="bi bi-film"></i> Trailer
                        </button>
                        ` : `
                        <button class="btn btn-outline-secondary btn-sm" onclick="showLoginPrompt('Please login to watch full movies')" title="Login Required">
                            <i class="bi bi-lock"></i> Watch
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="showLoginPrompt('Please login to watch trailers')" title="Login Required">
                            <i class="bi bi-lock"></i> Trailer
                        </button>
                        `}
                        <button class="btn btn-outline-success btn-sm" onclick="addToMyList(${movie.id})" title="Add to List">
                            <i class="bi bi-plus-circle"></i>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    `;

    return wrapper;
}

// Create movie card element with trailer button (for grid layout - kept for featured movies)
async function createMovieCard(movie) {
    // Check if user is logged in - use cached value if available
    let userLoggedIn = isUserLoggedIn;
    if (typeof checkAuthStatus === 'function') {
        // Use cached value from window if available, otherwise check
        if (window.isUserLoggedIn !== undefined) {
            userLoggedIn = window.isUserLoggedIn;
        } else {
            userLoggedIn = await checkAuthStatus();
            isUserLoggedIn = userLoggedIn;
            window.isUserLoggedIn = userLoggedIn;
        }
    }

    const col = document.createElement('div');
    col.className = 'col-6 col-md-4 col-lg-3';
    const safeTitle = (movie.title || 'Movie').replace(/'/g, "\\'");

    col.innerHTML = `
        <div class="card movie-card h-100">
            <div class="position-relative">
                <img src="${MovieAPI.getImageUrl(movie.poster_path)}" 
                     class="card-img-top" 
                     alt="${movie.title}"
                     onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'">
            </div>
            <div class="card-body">
                <h5 class="card-title">${movie.title}</h5>
                <p class="card-text mb-2">
                    <span class="text-muted me-2">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                    <i class="bi bi-star-fill text-warning"></i>
                    <span class="text-muted ms-1">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                </p>
                <div class="d-grid gap-2">
                    <button class="btn btn-primary btn-sm" onclick="viewMovieDetails(${movie.id})">
                        <i class="bi bi-info-circle"></i> View Details
                    </button>
                    <div class="btn-group" role="group">
                        ${userLoggedIn ? `
                        <button class="btn btn-outline-warning btn-sm" onclick="watchMovieWithAuth(${movie.id}, '${safeTitle}')" title="Watch Full Movie">
                            <i class="bi bi-play-fill"></i> Watch
                        </button>
                        <button class="btn btn-outline-primary btn-sm" onclick="watchTrailerWithAuth(${movie.id}, '${safeTitle}')" title="Watch Trailer">
                            <i class="bi bi-film"></i> Trailer
                        </button>
                        ` : `
                        <button class="btn btn-outline-secondary btn-sm" onclick="showLoginPrompt('Please login to watch full movies')" title="Login Required">
                            <i class="bi bi-lock"></i> Watch
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="showLoginPrompt('Please login to watch trailers')" title="Login Required">
                            <i class="bi bi-lock"></i> Trailer
                        </button>
                        `}
                        <button class="btn btn-outline-success btn-sm" onclick="addToMyList(${movie.id})" title="Add to List">
                            <i class="bi bi-plus-circle"></i>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    `;

    return col;
}

// Watch trailer function - automatically loads and plays trailer (uses global overlay)
async function watchTrailer(movieId, movieTitle = '') {
    // Fetch movie videos automatically
    const videos = await MovieAPI.getMovieVideos(movieId);
    const trailerUrl = MovieAPI.getTrailerUrl(videos);

    if (trailerUrl && typeof openTrailerOverlay === 'function') {
        openTrailerOverlay(trailerUrl, movieId, movieTitle);
    }
}

// View movie details
async function viewMovieDetails(movieId) {
    window.location.href = `movie-detail.php?id=${movieId}`;
}

// Add movie to my list
function addToMyList(movieId) {
    const myList = getMyList();

    if (!myList.includes(movieId)) {
        myList.push(movieId);
        saveMyList(myList);

        // Show success message
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

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

