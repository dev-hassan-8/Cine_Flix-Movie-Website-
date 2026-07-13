// My List page functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Check and cache authentication status first
    if (typeof checkAuthStatus === 'function') {
        window.isUserLoggedIn = await checkAuthStatus();
    } else {
        window.isUserLoggedIn = false;
    }

    await loadMyList();
});

// Load movies from my list
async function loadMyList() {
    const container = document.getElementById('myListGrid');
    const emptyList = document.getElementById('emptyList');

    if (!container) return;

    const myList = getMyList();

    if (myList.length === 0) {
        container.innerHTML = '';
        if (emptyList) emptyList.classList.remove('d-none');
        return;
    }

    if (emptyList) emptyList.classList.add('d-none');
    container.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"></div></div>';

    try {
        // Fetch movie details for each movie ID individually to prevent one failure breaking all
        const moviePromises = myList.map(async (movieId) => {
            try {
                return await MovieAPI.getMovieDetails(movieId);
            } catch (error) {
                console.warn(`Failed to load details for movie ID ${movieId}`);
                return null;
            }
        });

        const movies = await Promise.all(moviePromises);

        container.innerHTML = '';

        let hasMovies = false;
        movies.forEach((movie, index) => {
            if (movie && !movie.error) {
                const movieCard = createMovieCard(movie, myList[index]);
                container.appendChild(movieCard);
                hasMovies = true;
            }
        });

        if (!hasMovies) {
            if (emptyList) emptyList.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Error loading my list:', error);
        container.innerHTML = '<div class="col-12 text-center text-white"><p>Error loading movies. Please try again later.</p></div>';
    }
}

// Create movie card for my list
function createMovieCard(movie, movieId) {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-3 col-lg-2';
    const safeTitle = (movie.title || 'Movie').replace(/'/g, "\\'");
    const isLoggedIn = Boolean(window.isUserLoggedIn);

    const trailerButtonGroup = isLoggedIn
        ? `<button class="btn btn-outline-warning btn-sm" onclick="watchTrailerWithAuth(${movieId}, '${safeTitle}')" title="Watch Trailer">
            <i class="bi bi-play-fill"></i> Trailer
        </button>`
        : `<button class="btn btn-outline-secondary btn-sm" onclick="showLoginPrompt('Please login to watch trailers')" title="Login Required">
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
                    <button class="btn btn-primary btn-sm" onclick="viewMovieDetails(${movieId})">
                        <i class="bi bi-info-circle"></i> Details
                    </button>
                    <div class="btn-group" role="group">
                        ${trailerButtonGroup}
                        <button class="btn btn-outline-success btn-sm" onclick="removeFromMyList(${movieId})" title="Remove from List">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    <div class="btn-group mt-2" role="group">
                        ${isLoggedIn ? `
                        <button class="btn btn-outline-info btn-sm" onclick="downloadMovie(${movieId}, '${safeTitle}')">
                            <i class="bi bi-download"></i> Movie
                        </button>
                        <button class="btn btn-outline-info btn-sm" onclick="downloadTrailer(${movieId}, '${safeTitle}')">
                            <i class="bi bi-download"></i> Trailer
                        </button>
                        ` : `
                        <button class="btn btn-outline-secondary btn-sm" onclick="showLoginPrompt('Please login to download movies')" title="Login Required">
                            <i class="bi bi-lock"></i> Movie
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="showLoginPrompt('Please login to download trailers')" title="Login Required">
                            <i class="bi bi-lock"></i> Trailer DL
                        </button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;

    return col;
}

// Watch trailer function - open in responsive overlay
async function watchTrailer(movieId, movieTitle = '') {
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

    // Fetch movie details and videos
    const [movieDetails, videos] = await Promise.all([
        MovieAPI.getMovieDetails(movieId),
        MovieAPI.getMovieVideos(movieId)
    ]);

    if (movieDetails) {
        modalTitle.textContent = movieDetails.title;
        const trailerUrl = MovieAPI.getTrailerUrl(videos);

        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <img src="${MovieAPI.getImageUrl(movieDetails.poster_path)}" 
                         class="img-fluid rounded" 
                         alt="${movieDetails.title}">
                </div>
                <div class="col-md-8">
                    <h4>${movieDetails.title}</h4>
                    <p><strong>Release Date:</strong> ${movieDetails.release_date || 'N/A'}</p>
                    <p><strong>Rating:</strong> <i class="bi bi-star-fill text-warning"></i> ${movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A'}/10</p>
                    <p><strong>Overview:</strong></p>
                    <p>${movieDetails.overview || 'No overview available.'}</p>
                    ${trailerUrl ? `
                        <div class="mt-3">
                            <h5>Trailer</h5>
                        </div>
                    ` : '<p class="text-muted">No trailer available.</p>'}
                    <div class="mt-3">
                        <button class="btn btn-danger" onclick="removeFromMyList(${movieId}); bootstrap.Modal.getInstance(document.getElementById('movieModal')).hide();">
                            <i class="bi bi-trash"></i> Remove from List
                        </button>
                        <a href="movie-detail.php?id=${movieId}" class="btn btn-primary">
                            <i class="bi bi-arrow-right-circle"></i> View Full Details
                        </a>
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

// Remove movie from my list
function removeFromMyList(movieId) {
    const myList = getMyList();
    const updatedList = myList.filter(id => id !== movieId);

    saveMyList(updatedList);
    showNotification('Movie removed from your list!', 'success');

    // Reload the list
    loadMyList();
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
