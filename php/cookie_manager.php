<?php
/**
 * Cookie Management Utility
 * Handles all cookie operations: set, get, delete, check
 */

// Set a cookie with secure defaults
function setCookieSecure($name, $value, $expireDays = 30, $httpOnly = true) {
    $expire = time() + (86400 * $expireDays); // Days to seconds
    $path = '/';
    $domain = ''; // Current domain
    $secure = false; // Set to true if using HTTPS
    $httponly = $httpOnly;
    
    return setcookie($name, $value, $expire, $path, $domain, $secure, $httponly);
}

// Get cookie value
function getCookie($name, $default = null) {
    return isset($_COOKIE[$name]) ? $_COOKIE[$name] : $default;
}

// Delete a cookie
function deleteCookie($name) {
    if (isset($_COOKIE[$name])) {
        setcookie($name, '', time() - 3600, '/');
        unset($_COOKIE[$name]);
        return true;
    }
    return false;
}

// Set remember me cookie
function setRememberMeCookie($userId, $token, $expireDays = 30) {
    $cookieValue = base64_encode($userId . ':' . $token);
    return setCookieSecure('remember_me', $cookieValue, $expireDays, true);
}

// Get remember me data from cookie
function getRememberMeData() {
    $cookie = getCookie('remember_me');
    if ($cookie) {
        $decoded = base64_decode($cookie);
        $parts = explode(':', $decoded);
        if (count($parts) === 2) {
            return [
                'user_id' => $parts[0],
                'token' => $parts[1]
            ];
        }
    }
    return null;
}

// Delete remember me cookie
function deleteRememberMeCookie() {
    return deleteCookie('remember_me');
}

// Set user preference cookie
function setUserPreference($key, $value, $expireDays = 365) {
    $cookieName = 'user_pref_' . $key;
    return setCookieSecure($cookieName, $value, $expireDays, false);
}

// Get user preference from cookie
function getUserPreference($key, $default = null) {
    $cookieName = 'user_pref_' . $key;
    return getCookie($cookieName, $default);
}

// Delete user preference cookie
function deleteUserPreference($key) {
    $cookieName = 'user_pref_' . $key;
    return deleteCookie($cookieName);
}

// Clear all user cookies
function clearAllUserCookies() {
    // Delete remember me
    deleteRememberMeCookie();
    
    // Delete all preference cookies
    foreach ($_COOKIE as $name => $value) {
        if (strpos($name, 'user_pref_') === 0) {
            deleteCookie($name);
        }
    }
    
    return true;
}

// Check if cookies are enabled
function areCookiesEnabled() {
    if (isset($_COOKIE['cookie_test'])) {
        return true;
    }
    
    // Set a test cookie
    setcookie('cookie_test', '1', time() + 60, '/');
    
    // Check if it was set
    return isset($_COOKIE['cookie_test']);
}
?>

