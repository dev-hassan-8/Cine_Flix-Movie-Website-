<?php
/**
 * User Sign Up Handler
 * Handles user registration with session and cookie management
 */

require_once 'config.php';
require_once 'session_manager.php';
require_once 'cookie_manager.php';

// Start session
startSession();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../signup.php");
    exit();
}

// Get form data
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';
$terms = isset($_POST['terms']) ? true : false;

// Validation
$errors = [];

if (empty($name)) {
    $errors[] = "Name is required";
} elseif (strlen($name) < 2) {
    $errors[] = "Name must be at least 2 characters";
}

if (empty($email)) {
    $errors[] = "Email is required";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Invalid email format";
}

if (empty($password)) {
    $errors[] = "Password is required";
} elseif (strlen($password) < 6) {
    $errors[] = "Password must be at least 6 characters";
}

if ($password !== $confirm_password) {
    $errors[] = "Passwords do not match";
}

if (!$terms) {
    $errors[] = "You must agree to the terms and conditions";
}

// If there are errors, redirect back
if (!empty($errors)) {
    $errorMsg = implode(', ', $errors);
    header("Location: ../signup.php?error=" . urlencode($errorMsg));
    exit();
}

try {
    $conn = getDBConnection();
    
    // Ensure database is initialized
    initializeDatabase();
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    if (!$stmt) {
        throw new Exception("Database error: " . $conn->error);
    }
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $stmt->close();
        $conn->close();
        header("Location: ../signup.php?error=Email already registered. Please use a different email or login.");
        exit();
    }
    $stmt->close();
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    if (!$stmt) {
        throw new Exception("Database error: " . $conn->error);
    }
    $stmt->bind_param("sss", $name, $email, $hashed_password);
    
    if ($stmt->execute()) {
        $userId = $conn->insert_id;
        
        // Set user session
        setUserSession($userId, $name, $email);
        
        // Update last login (with error handling)
        // Check if last_login column exists first
        $columnCheck = $conn->query("SHOW COLUMNS FROM users LIKE 'last_login'");
        if ($columnCheck && $columnCheck->num_rows > 0) {
            $updateStmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            if ($updateStmt) {
                $updateStmt->bind_param("i", $userId);
                $updateStmt->execute();
                $updateStmt->close();
            } else {
                // Log error but don't fail signup
                error_log("Failed to prepare UPDATE statement for last_login: " . $conn->error);
            }
        } else {
            // Column doesn't exist, try to add it
            $conn->query("ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL AFTER updated_at");
            // Then try the update again
            $updateStmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            if ($updateStmt) {
                $updateStmt->bind_param("i", $userId);
                $updateStmt->execute();
                $updateStmt->close();
            }
        }
        
        $stmt->close();
        $conn->close();
        
        // Set user preference cookies
        setUserPreference('theme', 'dark', 365);
        setUserPreference('language', 'en', 365);
        
        // Redirect to homepage
        header("Location: ../index.php?success=Account created successfully! Welcome to CineFlix!");
        exit();
    } else {
        throw new Exception("Failed to create account");
    }
    
} catch (Exception $e) {
    error_log("Signup error: " . $e->getMessage());
    header("Location: ../signup.php?error=An error occurred. Please try again later.");
    exit();
}
?>

