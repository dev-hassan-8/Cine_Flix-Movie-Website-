<?php
/**
 * Database Connection Test Script
 * Use this to test if your database configuration is correct
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>CineFlix - Database Connection Test</h2>";
echo "<hr>";

// Test 1: Check PHP version
echo "<h3>1. PHP Version Check</h3>";
echo "PHP Version: " . phpversion() . "<br>";
if (version_compare(phpversion(), '7.4.0', '>=')) {
    echo "<span style='color: green;'>✓ PHP version is compatible</span><br>";
} else {
    echo "<span style='color: red;'>✗ PHP 7.4 or higher required</span><br>";
}
echo "<br>";

// Test 2: Check required extensions
echo "<h3>2. Required Extensions Check</h3>";
$required = ['mysqli', 'session', 'json'];
foreach ($required as $ext) {
    if (extension_loaded($ext)) {
        echo "<span style='color: green;'>✓ $ext extension is loaded</span><br>";
    } else {
        echo "<span style='color: red;'>✗ $ext extension is NOT loaded</span><br>";
    }
}
echo "<br>";

// Test 3: Test database connection
echo "<h3>3. Database Connection Test</h3>";
try {
    require_once 'config.php';
    
    echo "Attempting to connect to database...<br>";
    echo "Host: " . DB_HOST . "<br>";
    echo "User: " . DB_USER . "<br>";
    echo "Database: " . DB_NAME . "<br>";
    echo "<br>";
    
    $conn = getDBConnection();
    echo "<span style='color: green;'>✓ Database connection successful!</span><br>";
    
    // Test query
    $result = $conn->query("SHOW TABLES");
    echo "<br><strong>Existing Tables:</strong><br>";
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_array()) {
            echo "- " . $row[0] . "<br>";
        }
    } else {
        echo "No tables found (they will be created automatically)<br>";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "<span style='color: red;'>✗ Database connection failed!</span><br>";
    echo "Error: " . $e->getMessage() . "<br>";
    echo "<br>";
    echo "<strong>Common Solutions:</strong><br>";
    echo "1. Check database credentials in php/config.php<br>";
    echo "2. Ensure MySQL/MariaDB service is running<br>";
    echo "3. Verify database user has proper permissions<br>";
    echo "4. Check if database exists or allow auto-creation<br>";
}
echo "<br>";

// Test 4: Test session
echo "<h3>4. Session Test</h3>";
require_once 'session_manager.php';
startSession();
echo "<span style='color: green;'>✓ Session started successfully</span><br>";
echo "Session ID: " . session_id() . "<br>";
echo "Session Status: " . (session_status() === PHP_SESSION_ACTIVE ? "Active" : "Inactive") . "<br>";
echo "<br>";

// Test 5: Test cookies
echo "<h3>5. Cookie Test</h3>";
require_once 'cookie_manager.php';
if (areCookiesEnabled()) {
    echo "<span style='color: green;'>✓ Cookies are enabled</span><br>";
} else {
    echo "<span style='color: orange;'>⚠ Cookies may not be enabled (test cookie set)</span><br>";
}
echo "<br>";

// Test 6: File permissions
echo "<h3>6. File Permissions Check</h3>";
$phpDir = __DIR__;
if (is_writable($phpDir)) {
    echo "<span style='color: green;'>✓ PHP directory is writable</span><br>";
} else {
    echo "<span style='color: orange;'>⚠ PHP directory may not be writable</span><br>";
}

$sessionPath = session_save_path();
if ($sessionPath && is_writable($sessionPath)) {
    echo "<span style='color: green;'>✓ Session directory is writable</span><br>";
} else {
    echo "<span style='color: orange;'>⚠ Session directory may not be writable</span><br>";
    echo "Session save path: " . ($sessionPath ?: 'default system temp') . "<br>";
}
echo "<br>";

echo "<hr>";
echo "<h3>Summary</h3>";
echo "<p>If all tests pass, your authentication system is ready to use!</p>";
echo "<p><a href='../signup.php'>Go to Sign Up</a> | <a href='../login.php'>Go to Login</a> | <a href='../index.php'>Go to Home</a></p>";
?>

