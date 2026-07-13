/**
 * Authentication Helper for JavaScript
 * Checks if user is logged in and handles authentication-related UI
 */

// Check if user is logged in (via PHP session check)
async function checkAuthStatus() {
    try {
        const response = await fetch('php/check_auth.php?json=1');
        const data = await response.json();
        return data.logged_in === true;
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
}

// Get current user data
async function getCurrentUser() {
    try {
        const response = await fetch('php/check_auth.php?json=1');
        const data = await response.json();
        return data.user || null;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

// Show login prompt modal - CUSTOM OVERLAY (works without Bootstrap)
function showLoginPrompt(message = 'Please login to watch trailers') {
    // Remove existing login overlay if any
    const existingOverlay = document.getElementById('loginPromptOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    // Auto-scroll to top so popup is immediately visible
    try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
        window.scrollTo(0, 0);
    }

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'loginPromptOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.zIndex = '2500';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '20px';

    overlay.innerHTML = `
        <div style="position:relative; background:#15182e; border:2px solid #00d4ff; border-radius:15px; padding:30px; max-width:500px; width:100%; box-shadow:0 10px 40px rgba(0,212,255,0.3);">
            <button id="loginOverlayClose"
                    style="position:absolute; top:10px; right:10px; z-index:10; border:none; border-radius:50%; width:32px; height:32px; background:#fff; color:#000; font-weight:bold; cursor:pointer; font-size:20px; line-height:1;">
                &times;
            </button>
            <div class="text-center text-white">
                <i class="bi bi-lock" style="font-size: 4rem; color: #00d4ff; margin-bottom:20px; display:block;"></i>
                <h3 style="color:#00d4ff; margin-bottom:15px;">Login Required</h3>
                <p style="color:#ffffff; margin-bottom:10px; font-size:16px;">${message}</p>
                <p style="color:#b8bcc8; margin-bottom:25px; font-size:14px;">Create a free account or login to access this feature!</p>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                    <a href="login.php" style="background:linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); border:none; color:white; padding:12px 30px; border-radius:8px; text-decoration:none; font-weight:600; transition:all 0.3s;">
                        <i class="bi bi-box-arrow-in-right"></i> Login
                    </a>
                    <a href="signup.php" style="border:2px solid #00d4ff; color:#00d4ff; padding:12px 30px; border-radius:8px; text-decoration:none; font-weight:600; background:transparent; transition:all 0.3s;">
                        <i class="bi bi-person-plus"></i> Sign Up
                    </a>
                    <button id="loginCancelBtn" style="border:2px solid #666; color:#b8bcc8; padding:12px 30px; border-radius:8px; background:transparent; cursor:pointer; font-weight:600; transition:all 0.3s;">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Store original overflow
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Close function
    const closeOverlay = () => {
        document.body.style.overflow = originalOverflow || '';
        overlay.remove();
    };

    // Close button
    document.getElementById('loginOverlayClose').addEventListener('click', closeOverlay);

    // Cancel button
    const cancelBtn = document.getElementById('loginCancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeOverlay);
    }

    // Close when clicking outside
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeOverlay();
        }
    });
}

// Check if user can watch trailers
async function canWatchTrailers() {
    return await checkAuthStatus();
}

// Wrapper for watchTrailer function that checks auth
async function watchTrailerWithAuth(movieId, movieTitle = '') {
    // Use cached auth status if available
    let isLoggedIn = false;
    if (window.isUserLoggedIn !== undefined) {
        isLoggedIn = window.isUserLoggedIn;
    } else if (typeof checkAuthStatus === 'function') {
        isLoggedIn = await checkAuthStatus();
        window.isUserLoggedIn = isLoggedIn;
    }

    if (!isLoggedIn) {
        showLoginPrompt('Please login to watch movie trailers');
        return;
    }

    // User is logged in, proceed with trailer
    if (typeof watchTrailer === 'function') {
        // Auto-scroll to top so the popup is immediately visible
        try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            window.scrollTo(0, 0);
        }
        watchTrailer(movieId, movieTitle);
    } else {
        console.error('watchTrailer function not found');
    }
}


// Wrapper for watchMovie function that checks auth (NEW)
async function watchMovieWithAuth(movieId, movieTitle = '') {
    // Use cached auth status if available
    let isLoggedIn = false;
    if (window.isUserLoggedIn !== undefined) {
        isLoggedIn = window.isUserLoggedIn;
    } else if (typeof checkAuthStatus === 'function') {
        isLoggedIn = await checkAuthStatus();
        window.isUserLoggedIn = isLoggedIn;
    }

    if (!isLoggedIn) {
        showLoginPrompt('Please login to watch full movies');
        return;
    }

    // User is logged in, proceed with movie
    // We can reuse the trailer overlay for the movie
    const movieUrl = MovieAPI.getMovieEmbedUrl(movieId);
    if (movieUrl && typeof openTrailerOverlay === 'function') {
        // Auto-scroll to top so the popup is immediately visible
        try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            window.scrollTo(0, 0);
        }
        openTrailerOverlay(movieUrl, movieId, movieTitle);
    } else {
        console.error('Movie URL not found or openTrailerOverlay not available');
    }
}

// Update trailer buttons based on auth status
async function updateTrailerButtons() {
    // Use cached auth status if available
    let isLoggedIn = false;
    if (window.isUserLoggedIn !== undefined) {
        isLoggedIn = window.isUserLoggedIn;
    } else if (typeof checkAuthStatus === 'function') {
        isLoggedIn = await checkAuthStatus();
        window.isUserLoggedIn = isLoggedIn;
    }

    const trailerButtons = document.querySelectorAll('[onclick*="watchTrailer"], .btn-danger[onclick*="watchTrailer"], .btn[onclick*="watchTrailer"]');

    trailerButtons.forEach(button => {
        if (!isLoggedIn) {
            // Change button to show login required
            const originalOnclick = button.getAttribute('onclick');
            button.setAttribute('data-original-onclick', originalOnclick);
            button.setAttribute('onclick', 'showLoginPrompt("Please login to watch trailers")');
            button.classList.add('login-required');
            button.title = 'Login required to watch trailers';
        }
    });
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Check and cache authentication status first
    if (typeof checkAuthStatus === 'function') {
        window.isUserLoggedIn = await checkAuthStatus();
    } else {
        window.isUserLoggedIn = false;
    }

    // Update trailer buttons
    await updateTrailerButtons();

    // Update navigation (if needed)
    const user = await getCurrentUser();
    if (user) {
        // User is logged in - navigation should already be updated by PHP
        console.log('User logged in:', user.name);

        // Ensure dropdown is visible and working
        const dropdownToggle = document.getElementById('userDropdown');
        if (dropdownToggle) {
            // Make sure dropdown shows username
            const userName = user.name || 'User';
            if (!dropdownToggle.textContent.includes(userName)) {
                dropdownToggle.innerHTML = `<i class="bi bi-person-circle"></i> ${userName}`;
            }
        }

        // Enable all trailer access for logged-in users
        enableTrailerAccess();
    } else {
        // User not logged in - disable trailer access
        disableTrailerAccess();
    }
});

// Enable trailer access for logged-in users
function enableTrailerAccess() {
    // Remove any login-required classes
    const loginRequiredElements = document.querySelectorAll('.login-required');
    loginRequiredElements.forEach(el => {
        el.classList.remove('login-required');
    });

    // Update all trailer buttons to be accessible
    const trailerButtons = document.querySelectorAll('[onclick*="watchTrailer"], [onclick*="showLoginPrompt"]');
    trailerButtons.forEach(button => {
        const onclick = button.getAttribute('onclick');
        if (onclick && onclick.includes('showLoginPrompt')) {
            // Replace login prompt with actual trailer function
            const movieIdMatch = onclick.match(/watchTrailerWithAuth\((\d+)/);
            if (movieIdMatch) {
                const movieId = movieIdMatch[1];
                const movieTitle = onclick.match(/'([^']+)'/)?.[1] || '';
                button.setAttribute('onclick', `watchTrailerWithAuth(${movieId}, '${movieTitle}')`);
                button.classList.remove('btn-secondary');
                button.classList.add('btn-danger');
                if (button.querySelector('i')) {
                    button.querySelector('i').className = 'bi bi-play-circle-fill';
                }
            }
        }
    });
}

// Disable trailer access for non-logged-in users
function disableTrailerAccess() {
    // This is handled by the showLoginPrompt function
}

// Global helper: open trailer in full-screen overlay (used by all cards)
function openTrailerOverlay(trailerUrl, movieId = null, movieTitle = '') {
    if (!trailerUrl) return;

    // Remove existing overlay if any
    const existingOverlay = document.getElementById('trailerOverlay');
    if (existingOverlay) {
        const existingIframe = existingOverlay.querySelector('iframe');
        if (existingIframe) existingIframe.src = '';
        existingOverlay.remove();
    }

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'trailerOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.9)';
    overlay.style.zIndex = '2000';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'flex-start';
    overlay.style.padding = '0';
    overlay.style.overflowY = 'auto';

    overlay.innerHTML = `
        <button id="trailerOverlayClose"
                style="position:fixed; top:12px; right:12px; z-index:2100; border:none; border-radius:50%; width:32px; height:32px; background:#fff; color:#000; font-weight:bold; cursor:pointer;">
                &times;
        </button>
        <div style="position:relative; width:min(95vw, 1200px); margin:0 auto;">
            <div style="width:100%; aspect-ratio:16/9; background:#000; border-radius:8px; overflow:hidden;">
                <iframe id="globalTrailerIframe"
                        src="${trailerUrl}"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowfullscreen
                        style="width:100%; height:100%; border:none; display:block;"></iframe>
            </div>
            ${movieId ? `
            <div class="mt-3 text-center">
                <a href="movie-detail.php?id=${movieId}" class="btn btn-primary btn-sm">
                    <i class="bi bi-info-circle"></i> View Details
                </a>
                <button class="btn btn-success btn-sm" onclick="addToMyList(${movieId})">
                    <i class="bi bi-plus-circle"></i> Add to List
                </button>
            </div>
            ` : ''}
        </div>
    `;

    document.body.appendChild(overlay);

    // Lock background scroll and scroll to top so overlay is visible
    const previousBodyOverflow = document.body.style.overflow;
    document.body.dataset.prevOverflow = previousBodyOverflow;
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const closeOverlay = () => {
        const iframe = overlay.querySelector('iframe');
        if (iframe) iframe.src = '';
        overlay.remove();
        // Restore background scroll
        const prev = document.body.dataset.prevOverflow || '';
        document.body.style.overflow = prev;
        delete document.body.dataset.prevOverflow;
    };

    document.getElementById('trailerOverlayClose').addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeOverlay();
        }
    });
}

