// Movies page functionality
let currentFilter = 'popular';
let currentPage = 1;
let searchQuery = '';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Movies page loaded, initializing...');

    // Check authentication status first and cache it
    if (typeof checkAuthStatus === 'function') {
        window.isUserLoggedIn = await checkAuthStatus();
    } else {
        window.isUserLoggedIn = false;
    }

    // Check if API key is configured
    if (!MovieAPI.isApiKeyConfigured()) {
        console.warn('API key not configured');
        const container = document.getElementById('moviesGrid');
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.classList.add('d-none');
        }
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning text-center" role="alert">
                        <h5><i class="bi bi-exclamation-triangle"></i> API Key Required</h5>
                        <p>You need to add your TMDB API key to use this website.</p>
                        <p><strong>Don't worry - it's 100% FREE and takes less than 5 minutes!</strong></p>
                        <a href="api-setup.html" class="btn btn-primary btn-lg mt-3">
                            <i class="bi bi-key"></i> Get Your FREE API Key Now
                        </a>
                    </div>
                </div>
            `;
        }
        setupEventListeners();
        return;
    }

    // Check for filter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');

    if (filterParam && ['popular', 'top_rated', 'now_playing', 'upcoming'].includes(filterParam)) {
        currentFilter = filterParam;
        console.log('Filter from URL:', currentFilter);
        // Update active button
        const filterButtons = document.querySelectorAll('[data-filter]');
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filterParam) {
                btn.classList.add('active');
            }
        });
    }

    console.log('Loading movies with filter:', currentFilter);
    // Load movies based on filter
    await loadMovies(currentFilter);

    // Setup event listeners
    setupEventListeners();
    console.log('Movies page initialized');
});

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update current filter and load movies
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            searchQuery = '';
            document.getElementById('searchInput').value = '';
            await loadMovies(currentFilter);
        });
    });

    // Search button
    document.getElementById('searchBtn').addEventListener('click', async () => {
        await handleSearch();
    });

    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            await handleSearch();
        }
    });
}

// Handle search
async function handleSearch() {
    const query = document.getElementById('searchInput').value.trim();

    if (query) {
        searchQuery = query;
        currentPage = 1;
        await searchMovies(query);
    } else {
        // Clear search and load default movies
        searchQuery = '';
        await loadMovies(currentFilter);
    }
}

// Load movies based on filter - automatically loads on page load
async function loadMovies(filter) {
    const container = document.getElementById('moviesGrid');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noResults = document.getElementById('noResults');

    if (!container) {
        console.error('Movies container not found');
        return;
    }

    // Show loading spinner
    if (loadingSpinner) {
        loadingSpinner.classList.remove('d-none');
    }
    container.innerHTML = '';
    if (noResults) {
        noResults.classList.add('d-none');
    }

    let data = null;

    try {
        switch (filter) {
            case 'popular':
                data = await MovieAPI.getPopularMovies(currentPage);
                break;
            case 'top_rated':
                data = await MovieAPI.getTopRatedMovies(currentPage);
                break;
            case 'now_playing':
                data = await MovieAPI.getNowPlayingMovies(currentPage);
                break;
            case 'upcoming':
                data = await MovieAPI.getUpcomingMovies(currentPage);
                break;
            default:
                data = await MovieAPI.getPopularMovies(currentPage);
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        if (loadingSpinner) {
            loadingSpinner.classList.add('d-none');
        }
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    <h5><i class="bi bi-exclamation-triangle"></i> Error Loading Movies</h5>
                    <p>${error.message || 'An error occurred while loading movies. Please try again later.'}</p>
                </div>
            </div>
        `;
        return;
    }

    // Hide loading spinner
    if (loadingSpinner) {
        loadingSpinner.classList.add('d-none');
    }

    // Check for API errors
    if (data && data.error) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    <h5><i class="bi bi-exclamation-triangle"></i> API Error</h5>
                    <p>${data.error}</p>
                    ${data.error.includes('API key') ? `
                        <p class="mb-0">
                            <small>Please add your TMDB API key in <code>js/api.js</code></small><br>
                            <a href="api-setup.html" class="btn btn-sm btn-primary mt-2">Get API Key Guide</a>
                        </p>
                    ` : ''}
                </div>
            </div>
        `;
        return;
    }

    // Display movies if available
    if (data && data.results && data.results.length > 0) {
        console.log(`Displaying ${data.results.length} movies`);
        // Automatically display all movies with staggered animation
        for (const movie of data.results) {
            const movieCard = await createMovieCard(movie);
            container.appendChild(movieCard);
        }
        console.log('Movies displayed successfully');
    } else {
        console.warn('No movies found in API response');
        // No movies found
        if (noResults) {
            noResults.classList.remove('d-none');
        } else {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center" role="alert">
                        <h5><i class="bi bi-info-circle"></i> No Movies Found</h5>
                        <p>No movies available for this category. Please try a different filter.</p>
                    </div>
                </div>
            `;
        }
    }
}

// Search movies - automatically displays results
async function searchMovies(query) {
    const container = document.getElementById('moviesGrid');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noResults = document.getElementById('noResults');

    if (!container) {
        console.error('Movies container not found');
        return;
    }

    // Show loading spinner
    if (loadingSpinner) {
        loadingSpinner.classList.remove('d-none');
    }
    container.innerHTML = '';
    if (noResults) {
        noResults.classList.add('d-none');
    }

    let data = null;

    try {
        data = await MovieAPI.searchMovies(query, currentPage);
    } catch (error) {
        console.error('Error searching movies:', error);
        if (loadingSpinner) {
            loadingSpinner.classList.add('d-none');
        }
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    <h5><i class="bi bi-exclamation-triangle"></i> Search Error</h5>
                    <p>${error.message || 'An error occurred while searching. Please try again later.'}</p>
                </div>
            </div>
        `;
        return;
    }

    // Hide loading spinner
    if (loadingSpinner) {
        loadingSpinner.classList.add('d-none');
    }

    // Check for API errors
    if (data && data.error) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    <h5><i class="bi bi-exclamation-triangle"></i> Search Error</h5>
                    <p>${data.error}</p>
                    ${data.error.includes('API key') ? `
                        <p class="mb-0">
                            <small>Please add your TMDB API key in <code>js/api.js</code></small><br>
                            <a href="api-setup.html" class="btn btn-sm btn-primary mt-2">Get API Key Guide</a>
                        </p>
                    ` : ''}
                </div>
            </div>
        `;
        return;
    }

    // Display search results if available
    if (data && data.results && data.results.length > 0) {
        // Automatically display search results with animation
        for (const movie of data.results) {
            const movieCard = await createMovieCard(movie);
            container.appendChild(movieCard);
        }
    } else {
        // No results found
        if (noResults) {
            noResults.classList.remove('d-none');
        } else {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center" role="alert">
                        <h5><i class="bi bi-info-circle"></i> No Results Found</h5>
                        <p>No movies found for "${query}". Try searching with different keywords.</p>
                    </div>
                </div>
            `;
        }
    }
}

// Create movie card element
async function createMovieCard(movie) {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-3 col-lg-2';
    const safeTitle = (movie.title || 'Movie').replace(/'/g, "\\'");

    // Check if user is logged in - use cached value if available
    let isLoggedIn = false;
    if (window.isUserLoggedIn !== undefined) {
        isLoggedIn = window.isUserLoggedIn;
    } else if (typeof checkAuthStatus === 'function') {
        isLoggedIn = await checkAuthStatus();
        window.isUserLoggedIn = isLoggedIn;
    }

    const trailerButtonGroup = isLoggedIn
        ? `<button class="btn btn-outline-warning btn-sm" onclick="watchMovieWithAuth(${movie.id}, '${safeTitle}')" title="Watch Full Movie">
            <i class="bi bi-play-fill"></i> Watch
        </button>
        <button class="btn btn-outline-primary btn-sm" onclick="watchTrailerWithAuth(${movie.id}, '${safeTitle}')" title="Watch Trailer">
            <i class="bi bi-film"></i> Trailer
        </button>`
        : `<button class="btn btn-outline-secondary btn-sm" onclick="showLoginPrompt('Please login to watch full movies')" title="Login Required">
            <i class="bi bi-lock"></i> Watch
        </button>
        <button class="btn btn-outline-secondary btn-sm" onclick="showLoginPrompt('Please login to watch trailers')" title="Login Required">
            <i class="bi bi-lock"></i> Trailer
        </button>`;

    col.innerHTML = `
        <div class="card movie-card h-100">
            <div class="position-relative">
                <img src="${MovieAPI.getImageUrl(movie.poster_path)}" 
                     class="card-img-top" 
                     alt="${movie.title}"
                     onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'">
            </div>
            <div class="card-body d-flex flex-column">
                <h6 class="card-title">${movie.title}</h6>
                <p class="card-text small flex-grow-1 mb-2">
                    <span class="text-muted me-2">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                    <i class="bi bi-star-fill text-warning"></i>
                    <span class="text-muted ms-1">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                </p>
                <div class="d-grid gap-2 mt-auto">
                    <button class="btn btn-primary btn-sm" onclick="viewMovieDetails(${movie.id})">
                        <i class="bi bi-info-circle"></i> Details
                    </button>
                    <div class="btn-group" role="group">
                        ${trailerButtonGroup}
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

// Watch trailer function - automatically loads and plays trailer (with auth check, using global overlay)
async function watchTrailer(movieId, movieTitle = '') {
    // Check authentication first - use cached value if available
    let isLoggedIn = false;
    if (window.isUserLoggedIn !== undefined) {
        isLoggedIn = window.isUserLoggedIn;
    } else if (typeof checkAuthStatus === 'function') {
        isLoggedIn = await checkAuthStatus();
        window.isUserLoggedIn = isLoggedIn;
    }

    if (!isLoggedIn) {
        if (typeof showLoginPrompt === 'function') {
            showLoginPrompt('Please login to watch trailers');
        }
        return;
    }

    // Fetch movie videos automatically
    const videos = await MovieAPI.getMovieVideos(movieId);
    const trailerUrl = MovieAPI.getTrailerUrl(videos);

    if (trailerUrl && typeof openTrailerOverlay === 'function') {
        openTrailerOverlay(trailerUrl, movieId, movieTitle);
    }
}

// View movie details
async function viewMovieDetails(movieId) {
    // Show modal with movie details
    const modalElement = document.getElementById('movieModal');
    const modal = new bootstrap.Modal(modalElement);
    const modalTitle = document.getElementById('movieModalTitle');
    const modalBody = document.getElementById('movieModalBody');

    let trailerIframe = null;

    // Function to stop trailer when modal closes
    const stopTrailer = () => {
        if (trailerIframe) {
            trailerIframe.src = ''; // Remove src to stop playback
            trailerIframe = null;
        }
    };

    // Listen for modal close events
    modalElement.addEventListener('hidden.bs.modal', stopTrailer);

    modalTitle.textContent = 'Loading...';
    modalBody.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div></div>';
    modal.show();

    // Fetch movie details and videos automatically
    const movieData = await MovieAPI.getMovieWithTrailer(movieId);

    if (movieData) {
        modalTitle.textContent = movieData.title;
        const trailerUrl = movieData.mainTrailer;
        const allTrailers = movieData.trailers || [];

        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <img src="${MovieAPI.getImageUrl(movieData.poster_path)}" 
                         class="img-fluid rounded" 
                         alt="${movieData.title}">
                </div>
                <div class="col-md-8">
                    <h4>${movieData.title}</h4>
                    <p><strong>Release Date:</strong> ${movieData.release_date || 'N/A'}</p>
                    <p><strong>Rating:</strong> <i class="bi bi-star-fill text-warning"></i> ${movieData.vote_average ? movieData.vote_average.toFixed(1) : 'N/A'}/10</p>
                    <p><strong>Overview:</strong></p>
                    <p>${movieData.overview || 'No overview available.'}</p>
                    ${trailerUrl ? `
                        <div class="mt-3">
                            <h5>Watch Full Movie</h5>
                            ${allTrailers.length > 1 ? `
                                <div class="mt-2">
                                    <small class="text-muted">${allTrailers.length} video(s) available</small>
                                </div>
                            ` : ''}
                        </div>
                    ` : '<p class="text-muted">No video available.</p>'}
                    <div class="mt-3">
                        <button class="btn btn-success" onclick="addToMyList(${movieId}); bootstrap.Modal.getInstance(document.getElementById('movieModal')).hide();">
                            <i class="bi bi-plus-circle"></i> Add to My List
                        </button>
                        <a href="movie-detail.php?id=${movieId}" class="btn btn-primary">
                            <i class="bi bi-arrow-right-circle"></i> View Full Details
                        </a>
                        ${trailerUrl ? `
                            <button class="btn btn-warning" onclick="watchTrailerWithAuth(${movieId}, '${movieData.title.replace(/'/g, "\\'")}')">
                                <i class="bi bi-play-fill"></i> Watch Trailer
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // No inline trailer iframe; trailer plays in overlay via button
    } else {
        modalTitle.textContent = 'Error';
        modalBody.innerHTML = '<p>Failed to load movie details. Please try again later.</p>';
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

