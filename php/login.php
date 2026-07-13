<?php
/**
 * User Login Handler
 * Handles user authentication with session and cookie management
 */

require_once 'config.php';
require_once 'session_manager.php';
require_once 'cookie_manager.php';

// Start session
startSession();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../login.php");
    exit();
}

// Get form data
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$remember = isset($_POST['remember']) ? true : false;

// Validation
if (empty($email) || empty($password)) {
    header("Location: ../login.php?error=Email and password are required");
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header("Location: ../login.php?error=Invalid email format");
    exit();
}

try {
    $conn = getDBConnection();
    
    // Get user by email
    $stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Get user IP and user agent for logging
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        $ip_address = $_SERVER['HTTP_X_REAL_IP'];
    }
    
    if ($result->num_rows === 0) {
        // Log failed login attempt (email not found)
        $failedStmt = $conn->prepare("INSERT INTO login_history (user_id, ip_address, user_agent, login_status) VALUES (0, ?, ?, 'failed')");
        $failedStmt->bind_param("ss", $ip_address, $user_agent);
        $failedStmt->execute();
        $failedStmt->close();
        
        $stmt->close();
        $conn->close();
        header("Location: ../login.php?error=Invalid email or password");
        exit();
    }
    
    $user = $result->fetch_assoc();
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        // Log failed login attempt (wrong password)
        $failedStmt = $conn->prepare("INSERT INTO login_history (user_id, ip_address, user_agent, login_status) VALUES (?, ?, ?, 'failed')");
        $failedStmt->bind_param("iss", $user['id'], $ip_address, $user_agent);
        $failedStmt->execute();
        $failedStmt->close();
        
        $stmt->close();
        $conn->close();
        header("Location: ../login.php?error=Invalid email or password");
        exit();
    }
    
    // Get user IP address and user agent
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    
    // Handle proxy/load balancer IP
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        $ip_address = $_SERVER['HTTP_X_REAL_IP'];
    }
    
    // Set user session
    setUserSession($user['id'], $user['name'], $user['email']);
    
    // Update last login with detailed information
    $updateStmt = $conn->prepare("UPDATE users SET 
        last_login = NOW(), 
        last_login_ip = ?, 
        last_login_user_agent = ?, 
        login_count = login_count + 1 
        WHERE id = ?");
    $updateStmt->bind_param("ssi", $ip_address, $user_agent, $user['id']);
    $updateStmt->execute();
    $updateStmt->close();
    
    // Save login history
    $historyStmt = $conn->prepare("INSERT INTO login_history (user_id, ip_address, user_agent, login_status) VALUES (?, ?, ?, 'success')");
    $historyStmt->bind_param("iss", $user['id'], $ip_address, $user_agent);
    $historyStmt->execute();
    $historyStmt->close();
    
    // Handle remember me cookie
    if ($remember) {
        // Generate a secure token
        $token = bin2hex(random_bytes(32));
        
        // Store token in database (you might want to create a remember_tokens table)
        // For now, we'll just set a cookie with user ID and token
        setRememberMeCookie($user['id'], $token, 30); // 30 days
        
        // Store token in session for validation
        $_SESSION['remember_token'] = $token;
    } else {
        // Delete remember me cookie if exists
        deleteRememberMeCookie();
    }
    
    $stmt->close();
    $conn->close();
    
    // Set user preference cookies if not set
    if (getUserPreference('theme') === null) {
        setUserPreference('theme', 'dark', 365);
    }
    if (getUserPreference('language') === null) {
        setUserPreference('language', 'en', 365);
    }
    
    // Redirect to homepage
    header("Location: ../index.php?success=Welcome back, " . htmlspecialchars($user['name']) . "!");
    exit();
    
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    header("Location: ../login.php?error=An error occurred. Please try again later.");
    exit();
}
?>

