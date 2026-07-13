<?php
/**
 * Database Configuration
 * CineFlix - Movie Website
 */

// Database credentials for XAMPP
define('DB_HOST', 'localhost');
define('DB_USER', 'root');        // XAMPP default username
define('DB_PASS', '');            // XAMPP default password (empty)
define('DB_NAME', 'cineflix_db'); // Your database name

// Create database connection
function getDBConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        $conn->set_charset("utf8mb4");
        return $conn;
    } catch (Exception $e) {
        die("Database connection error: " . $e->getMessage());
    }
}

// Initialize database and create tables if they don't exist
function initializeDatabase() {
    try {
        // First, connect without database to create it if needed
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
        
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        // Create database if it doesn't exist
        $sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
        $conn->query($sql);
        $conn->close();
        
        // Now connect to the database
        $conn = getDBConnection();
        
        // Create users table
        $sql = "CREATE TABLE IF NOT EXISTS users (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            last_login_ip VARCHAR(45) NULL,
            last_login_user_agent TEXT NULL,
            login_count INT(11) DEFAULT 0,
            INDEX idx_email (email),
            INDEX idx_last_login (last_login)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->query($sql);
        
        // Add new columns if they don't exist (for existing databases)
        $columns = ['last_login_ip', 'last_login_user_agent', 'login_count'];
        foreach ($columns as $column) {
            $checkColumn = $conn->query("SHOW COLUMNS FROM users LIKE '$column'");
            if ($checkColumn->num_rows == 0) {
                if ($column == 'last_login_ip') {
                    $conn->query("ALTER TABLE users ADD COLUMN $column VARCHAR(45) NULL AFTER last_login");
                } elseif ($column == 'last_login_user_agent') {
                    $conn->query("ALTER TABLE users ADD COLUMN $column TEXT NULL AFTER last_login_ip");
                } elseif ($column == 'login_count') {
                    $conn->query("ALTER TABLE users ADD COLUMN $column INT(11) DEFAULT 0 AFTER last_login_user_agent");
                }
            }
        }
        
        // Create login_history table for detailed login tracking
        $sql = "CREATE TABLE IF NOT EXISTS login_history (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            user_id INT(11) NOT NULL,
            login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address VARCHAR(45) NULL,
            user_agent TEXT NULL,
            login_status ENUM('success', 'failed') DEFAULT 'success',
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id),
            INDEX idx_login_time (login_time)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->query($sql);
        
        // Create user_movies table (for personal movie lists)
        $sql = "CREATE TABLE IF NOT EXISTS user_movies (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            user_id INT(11) NOT NULL,
            movie_id INT(11) NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_movie (user_id, movie_id),
            INDEX idx_user_id (user_id),
            INDEX idx_movie_id (movie_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->query($sql);
        
        $conn->close();
        return true;
    } catch (Exception $e) {
        error_log("Database initialization error: " . $e->getMessage());
        return false;
    }
}

// Initialize database on first load (only if not in CLI mode)
if (php_sapi_name() !== 'cli') {
    initializeDatabase();
}
?>

