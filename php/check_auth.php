<?php
/**
 * Authentication Check Script
 * Use this to check if user is logged in via AJAX or include
 */

require_once 'session_manager.php';
require_once 'cookie_manager.php';

// Start session
startSession();

// Check remember me cookie if session expired
if (!isLoggedIn() && isset($_COOKIE['remember_me'])) {
    $rememberData = getRememberMeData();
    if ($rememberData) {
        try {
            require_once 'config.php';
            $conn = getDBConnection();
            
            $userId = intval($rememberData['user_id']);
            $stmt = $conn->prepare("SELECT id, name, email FROM users WHERE id = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                // Restore session
                setUserSession($user['id'], $user['name'], $user['email']);
            } else {
                // Invalid token, delete cookie
                deleteRememberMeCookie();
            }
            
            $stmt->close();
            $conn->close();
        } catch (Exception $e) {
            error_log("Remember me error: " . $e->getMessage());
        }
    }
}

// Return JSON response if requested via AJAX
if (isset($_GET['json']) || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) {
    header('Content-Type: application/json');
    echo json_encode([
        'logged_in' => isLoggedIn(),
        'user' => getUserData()
    ]);
    exit();
}

// Return boolean if just checking
return isLoggedIn();
?>

