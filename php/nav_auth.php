<?php
/**
 * Navigation Authentication Helper
 * Provides navigation items based on authentication status
 */

require_once 'session_manager.php';
require_once 'cookie_manager.php';

// Start session and check authentication
startSession();
maintainSession();

$isLoggedIn = isLoggedIn();
$userData = getUserData();
?>

