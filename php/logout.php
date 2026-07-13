<?php
/**
 * User Logout Handler
 * Destroys session and clears cookies
 */

require_once 'session_manager.php';
require_once 'cookie_manager.php';

// Start session
startSession();

// Get user name for goodbye message
$userName = $_SESSION['user_name'] ?? 'User';

// Destroy session
endSession();

// Clear all user cookies
clearAllUserCookies();

// Delete remember me cookie
deleteRememberMeCookie();

// Redirect to homepage with success message
header("Location: ../index.php?success=You have been logged out successfully. Goodbye, " . htmlspecialchars($userName) . "!");
exit();
?>

