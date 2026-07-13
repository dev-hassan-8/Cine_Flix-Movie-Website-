// Cookie Consent Management
(function () {
    'use strict';

    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');

    if (!cookieConsent) {
        // Show cookie consent banner after a short delay
        setTimeout(showCookieBanner, 1000);
    } else if (cookieConsent === 'accepted') {
        // Enable cookies/tracking if accepted
        enableCookies();
    }

    function showCookieBanner() {
        // Create cookie banner HTML
        const banner = document.createElement('div');
        banner.id = 'cookieConsentBanner';
        banner.className = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-consent-container">
                <div class="cookie-icon">
                    <i class="bi bi-shield-lock"></i>
                </div>
                <div class="cookie-content">
                    <h5 class="cookie-title">Privacy & Cookie Consent</h5>
                    <p class="cookie-description">
                        We use cookies to ensure you get the best experience on CineFlix. 
                        They are essential for:
                    </p>
                    <div class="cookie-features">
                        <span class="cookie-feature"><i class="bi bi-person-check"></i> Authentication</span>
                        <span class="cookie-feature"><i class="bi bi-sliders"></i> Preferences</span>
                        <span class="cookie-feature"><i class="bi bi-graph-up"></i> Analytics</span>
                    </div>
                    <p class="cookie-description" style="font-size: 0.9rem; margin-top: 1rem; color: #888;">
                        By clicking "Accept All", you consent to our use of cookies as described in our 
                        <a href="#" class="cookie-policy-link" onclick="event.preventDefault(); alert('Cookie Policy: We use cookies strictly for authentication, saving your movie lists, and anonymous usage analytics to improve the platform.');">Privacy Policy</a>.
                    </p>
                </div>
                <div class="cookie-buttons">
                    <button class="cookie-btn btn-primary" id="acceptCookies">
                        <i class="bi bi-check-lg"></i> Accept All
                    </button>
                    <button class="cookie-btn btn-outline-light" id="rejectCookies">
                        <i class="bi bi-x-lg"></i> Reject Non-Essential
                    </button>
                </div>
            </div>
        `;

        // Add banner to page
        document.body.appendChild(banner);

        // Add event listeners
        document.getElementById('acceptCookies').addEventListener('click', acceptCookies);
        document.getElementById('rejectCookies').addEventListener('click', rejectCookies);

        // Animate banner in
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    function acceptCookies() {
        // Save consent
        localStorage.setItem('cookieConsent', 'accepted');

        // Enable cookies
        enableCookies();

        // Hide banner
        hideBanner();

        // Show success message
        showNotification('Cookie preferences saved. Cookies enabled.', 'success');
    }

    function rejectCookies() {
        // Save rejection
        localStorage.setItem('cookieConsent', 'rejected');

        // Disable cookies
        disableCookies();

        // Hide banner
        hideBanner();

        // Show info message
        showNotification('Cookie preferences saved. Only essential cookies will be used.', 'info');
    }

    function hideBanner() {
        const banner = document.getElementById('cookieConsentBanner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    function enableCookies() {
        // Enable analytics, tracking, etc.
        console.log('Cookies enabled');
        // You can add Google Analytics or other tracking code here
        // Example: gtag('consent', 'update', { 'analytics_storage': 'granted' });
    }

    function disableCookies() {
        // Disable non-essential cookies
        console.log('Non-essential cookies disabled');
        // Clear any existing tracking cookies
        // Keep only essential cookies for authentication
    }

    function showNotification(message, type = 'info') {
        // Check if showNotification function exists globally
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
            notification.style.zIndex = '10000';
            notification.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }

    // Expose function to reset cookie consent (for testing)
    window.resetCookieConsent = function () {
        localStorage.removeItem('cookieConsent');
        location.reload();
    };
})();
