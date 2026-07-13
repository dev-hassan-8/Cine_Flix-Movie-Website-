// Global variable to store current video mode
window.currentVideoMode = 'movie'; // Default to full movie

// Switch between Full Movie and Trailer modes
async function switchVideoMode(mode) {
    // Check authentication first
    let isLoggedIn = false;
    if (window.isUserLoggedIn !== undefined) {
        isLoggedIn = window.isUserLoggedIn;
    } else if (typeof checkAuthStatus === 'function') {
        isLoggedIn = await checkAuthStatus();
        window.isUserLoggedIn = isLoggedIn;
    }

    if (!isLoggedIn) {
        if (typeof showLoginPrompt === 'function') {
            showLoginPrompt('Please login to watch videos');
        }
        return;
    }

    // Update current mode
    window.currentVideoMode = mode;

    // Update button states
    const fullMovieBtn = document.getElementById('fullMovieBtn');
    const trailerBtn = document.getElementById('trailerBtn');
    const videoModeTitle = document.getElementById('videoModeTitle');

    if (mode === 'movie') {
        fullMovieBtn.classList.remove('btn-outline-primary');
        fullMovieBtn.classList.add('btn-primary', 'active');
        trailerBtn.classList.remove('btn-primary', 'active');
        trailerBtn.classList.add('btn-outline-primary');
        videoModeTitle.textContent = 'Watch Full Movie';
    } else {
        trailerBtn.classList.remove('btn-outline-primary');
        trailerBtn.classList.add('btn-primary', 'active');
        fullMovieBtn.classList.remove('btn-primary', 'active');
        fullMovieBtn.classList.add('btn-outline-primary');
        videoModeTitle.textContent = 'Watch Trailer';
    }

    // Reload the video with the selected mode
    const movieContainer = document.getElementById('movieContainer');

    // Determine which URL to use
    let targetUrl = '';
    if (mode === 'movie') {
        targetUrl = window.fullMovieUrl || window.mainMovieUrl;
    } else {
        targetUrl = window.trailerUrl;
    }

    if (movieContainer && targetUrl) {
        // Clear existing content
        movieContainer.innerHTML = '';

        // Show loading state
        movieContainer.innerHTML = `
            <div id="moviePlaceholder" class="d-flex align-items-center justify-content-center bg-dark text-white" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                <div class="text-center">
                    <i class="bi bi-play-circle" style="font-size: 3rem; color: var(--primary-color);"></i>
                    <p class="mt-3">Loading ${mode === 'movie' ? 'movie' : 'trailer'}...</p>
                </div>
            </div>
        `;

        // Load video after a short delay for smooth transition
        setTimeout(() => {
            // Check if it's a YouTube URL to add params
            const isYouTube = targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be');
            const finalUrl = isYouTube ? `${targetUrl}?autoplay=0&rel=0` : targetUrl;

            movieContainer.innerHTML = `
                <iframe id="mainMovie" 
                        src="${finalUrl}" 
                        allow="autoplay; encrypted-media; picture-in-picture" 
                        allowfullscreen
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; display: block;"></iframe>
            `;

            // Show notification
            if (typeof showNotification === 'function') {
                showNotification(
                    mode === 'movie'
                        ? '<i class="bi bi-film"></i> Switched to Full Movie mode'
                        : '<i class="bi bi-play-circle"></i> Switched to Trailer mode',
                    'success'
                );
            }
        }, 300);
    }
}
