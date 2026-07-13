<?php
/**
 * Session Management Utility
 * Handles all session operations: start, maintain, destroy, end
 */

// Start session if not already started
function startSession() {
    if (session_status() === PHP_SESSION_NONE) {
        // Configure session settings
        ini_set('session.cookie_httponly', 1);
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS
        ini_set('session.cookie_samesite', 'Strict');
        
        // Start session
        session_start();
        
        // Regenerate session ID periodically for security
        if (!isset($_SESSION['created'])) {
            $_SESSION['created'] = time();
        } else if (time() - $_SESSION['created'] > 1800) {
            // Regenerate every 30 minutes
            session_regenerate_id(true);
            $_SESSION['created'] = time();
        }
    }
}

// Maintain session - check if user is still logged in
function maintainSession() {
    startSession();
    
    // Check if user is logged in
    if (isset($_SESSION['user_id'])) {
        // Check session timeout (30 minutes of inactivity)
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
            // Session expired
            destroySession();
            return false;
        }
        
        // Update last activity time
        $_SESSION['last_activity'] = time();
        return true;
    }
    
    return false;
}

// Check if user is logged in
function isLoggedIn() {
    startSession();
    return isset($_SESSION['user_id']) && maintainSession();
}

// Get current user ID
function getUserId() {
    startSession();
    return isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
}

// Get current user data
function getUserData() {
    startSession();
    if (!isLoggedIn()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'] ?? '',
        'email' => $_SESSION['user_email'] ?? ''
    ];
}

// Set user session data
function setUserSession($userId, $userName, $userEmail) {
    startSession();
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_name'] = $userName;
    $_SESSION['user_email'] = $userEmail;
    $_SESSION['last_activity'] = time();
    $_SESSION['created'] = time();
}

// Destroy session completely
function destroySession() {
    startSession();
    
    // Unset all session variables
    $_SESSION = array();
    
    // Delete session cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Destroy session
    session_destroy();
}

// End session (logout)
function endSession() {
    destroySession();
}

// Require login - redirect if not logged in
function requireLogin($redirectUrl = 'login.php') {
    if (!isLoggedIn()) {
        // Determine correct path based on where the function is called from
        $basePath = (strpos($redirectUrl, '/') === 0) ? '' : '../';
        header("Location: " . $basePath . $redirectUrl . "?error=Please login to access this page");
        exit();
    }
}

// Get session status info (for debugging)
function getSessionInfo() {
    startSession();
    return [
        'session_id' => session_id(),
        'user_id' => $_SESSION['user_id'] ?? null,
        'user_name' => $_SESSION['user_name'] ?? null,
        'last_activity' => isset($_SESSION['last_activity']) ? date('Y-m-d H:i:s', $_SESSION['last_activity']) : null,
        'created' => isset($_SESSION['created']) ? date('Y-m-d H:i:s', $_SESSION['created']) : null,
        'session_status' => session_status()
    ];
}
?>

