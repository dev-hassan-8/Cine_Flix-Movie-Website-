/**
 * Authentication & Session Manager for CineFlix (Vercel & Client-Side Compatible)
 * Manages user registration, login, logout, and navbar updates with localStorage.
 */

class AuthManager {
    static USERS_KEY = 'cineflix_users';
    static SESSION_KEY = 'cineflix_current_user';

    // Get all registered users
    static getUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.USERS_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    // Save users list
    static saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    // Register a new user
    static signUp(name, email, password) {
        const users = this.getUsers();
        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const exists = users.some(u => u.email.toLowerCase() === normalizedEmail);
        if (exists) {
            return { success: false, message: 'An account with this email already exists!' };
        }

        const newUser = {
            id: Date.now().toString(),
            name: name.trim(),
            email: normalizedEmail,
            password: password, // In production client demo, stored locally
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);

        // Auto-login upon registration
        this.setCurrentUser(newUser);
        return { success: true, user: newUser };
    }

    // Login user
    static login(email, password, remember = true) {
        const users = this.getUsers();
        const normalizedEmail = email.trim().toLowerCase();

        // Default demo account if database is empty
        if (users.length === 0 && normalizedEmail === 'demo@cineflix.com' && password === '123456') {
            const demoUser = {
                id: 'demo-user-1',
                name: 'Demo User',
                email: 'demo@cineflix.com',
                password: 'password123',
                created_at: new Date().toISOString()
            };
            this.saveUsers([demoUser]);
            this.setCurrentUser(demoUser);
            return { success: true, user: demoUser };
        }

        const user = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);
        if (!user) {
            return { success: false, message: 'Invalid email or password. Please check your credentials.' };
        }

        this.setCurrentUser(user);
        return { success: true, user };
    }

    // Set current active user session
    static setCurrentUser(user) {
        const sessionData = {
            id: user.id,
            name: user.name,
            email: user.email,
            loginTime: Date.now()
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        window.isUserLoggedIn = true;
    }

    // Get current logged-in user
    static getCurrentUser() {
        try {
            const data = localStorage.getItem(this.SESSION_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    // Check if user is logged in
    static isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    // Logout
    static logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.isUserLoggedIn = false;
        window.location.href = 'index.html?success=You+have+been+logged+out+successfully';
    }

    // Synchronize Navbar UI across all pages
    static updateNavAuth() {
        const user = this.getCurrentUser();
        const guestElements = document.querySelectorAll('.auth-guest');
        const userElements = document.querySelectorAll('.auth-user');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const logoutBtn = document.getElementById('logoutBtn');

        if (user) {
            window.isUserLoggedIn = true;
            guestElements.forEach(el => el.classList.add('d-none'));
            userElements.forEach(el => el.classList.remove('d-none'));
            if (userNameDisplay) {
                userNameDisplay.textContent = user.name || 'Account';
            }
        } else {
            window.isUserLoggedIn = false;
            guestElements.forEach(el => el.classList.remove('d-none'));
            userElements.forEach(el => el.classList.add('d-none'));
        }

        if (logoutBtn) {
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                AuthManager.logout();
            };
        }
    }
}

// Global functions for backward compatibility with existing code
async function checkAuthStatus() {
    return AuthManager.isLoggedIn();
}

async function getCurrentUser() {
    return AuthManager.getCurrentUser();
}

// Show login prompt modal - CUSTOM OVERLAY
function showLoginPrompt(message = 'Please login to watch trailers') {
    const existingOverlay = document.getElementById('loginPromptOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
        window.scrollTo(0, 0);
    }

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
                    <a href="login.html" style="background:linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); border:none; color:white; padding:12px 30px; border-radius:8px; text-decoration:none; font-weight:600; transition:all 0.3s;">
                        <i class="bi bi-box-arrow-in-right"></i> Login
                    </a>
                    <a href="signup.html" style="border:2px solid #00d4ff; color:#00d4ff; padding:12px 30px; border-radius:8px; text-decoration:none; font-weight:600; background:transparent; transition:all 0.3s;">
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

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const closeOverlay = () => {
        document.body.style.overflow = originalOverflow || '';
        overlay.remove();
    };

    document.getElementById('loginOverlayClose').addEventListener('click', closeOverlay);
    const cancelBtn = document.getElementById('loginCancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeOverlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay();
    });
}

// Check if user can watch trailers
async function canWatchTrailers() {
    return AuthManager.isLoggedIn();
}

// Wrapper for watchTrailer function that checks auth
async function watchTrailerWithAuth(movieId, movieTitle = '') {
    if (!AuthManager.isLoggedIn()) {
        showLoginPrompt('Please login to watch movie trailers');
        return;
    }

    if (typeof watchTrailer === 'function') {
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

// Wrapper for watchMovie function that checks auth
async function watchMovieWithAuth(movieId, movieTitle = '') {
    if (!AuthManager.isLoggedIn()) {
        showLoginPrompt('Please login to watch full movies');
        return;
    }

    const movieUrl = MovieAPI.getMovieEmbedUrl(movieId);
    if (movieUrl && typeof openTrailerOverlay === 'function') {
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
    const isLoggedIn = AuthManager.isLoggedIn();
    const trailerButtons = document.querySelectorAll('[onclick*="watchTrailer"], .btn-danger[onclick*="watchTrailer"], .btn[onclick*="watchTrailer"]');

    trailerButtons.forEach(button => {
        if (!isLoggedIn) {
            const originalOnclick = button.getAttribute('onclick');
            button.setAttribute('data-original-onclick', originalOnclick);
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.updateNavAuth();
    updateTrailerButtons();
});
