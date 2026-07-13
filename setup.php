<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CineFlix - Setup & Configuration</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .setup-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .test-item {
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #ddd;
        }
        .test-item.success {
            background: #d4edda;
            border-left-color: #28a745;
        }
        .test-item.error {
            background: #f8d7da;
            border-left-color: #dc3545;
        }
        .test-item.warning {
            background: #fff3cd;
            border-left-color: #ffc107;
        }
        .test-item.info {
            background: #d1ecf1;
            border-left-color: #17a2b8;
        }
        .status-icon {
            font-size: 1.5rem;
            margin-right: 10px;
        }
        .quick-links {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="setup-container">
        <div class="text-center mb-4">
            <h1 class="display-4"><i class="bi bi-film"></i> CineFlix</h1>
            <h2>Website Setup & Configuration</h2>
            <p class="lead">Complete setup verification and quick access</p>
        </div>

        <?php
        error_reporting(E_ALL);
        ini_set('display_errors', 1);
        
        $allTestsPassed = true;
        ?>

        <!-- PHP Version Check -->
        <div class="test-item <?php echo version_compare(phpversion(), '7.4.0', '>=') ? 'success' : 'error'; ?>">
            <h4>
                <i class="bi <?php echo version_compare(phpversion(), '7.4.0', '>=') ? 'bi-check-circle-fill' : 'bi-x-circle-fill'; ?> status-icon"></i>
                PHP Version
            </h4>
            <p class="mb-0">
                Current: <strong><?php echo phpversion(); ?></strong>
                <?php if (version_compare(phpversion(), '7.4.0', '>=')): ?>
                    <span class="badge bg-success">✓ Compatible</span>
                <?php else: ?>
                    <span class="badge bg-danger">✗ PHP 7.4+ required</span>
                    <?php $allTestsPassed = false; ?>
                <?php endif; ?>
            </p>
        </div>

        <!-- Required Extensions -->
        <div class="test-item">
            <h4><i class="bi bi-puzzle-fill status-icon"></i> PHP Extensions</h4>
            <?php
            $required = ['mysqli', 'session', 'json'];
            $allLoaded = true;
            foreach ($required as $ext):
                $loaded = extension_loaded($ext);
                if (!$loaded) $allLoaded = false;
            ?>
                <p class="mb-1">
                    <?php echo $ext; ?>: 
                    <?php if ($loaded): ?>
                        <span class="badge bg-success">✓ Loaded</span>
                    <?php else: ?>
                        <span class="badge bg-danger">✗ Missing</span>
                        <?php $allTestsPassed = false; ?>
                    <?php endif; ?>
                </p>
            <?php endforeach; ?>
            <?php if (!$allLoaded): ?>
                <div class="alert alert-warning mt-2">
                    <strong>Note:</strong> Enable missing extensions in php.ini and restart Apache
                </div>
            <?php endif; ?>
        </div>

        <!-- Database Connection -->
        <div class="test-item <?php
            try {
                require_once 'php/config.php';
                $conn = getDBConnection();
                echo 'success';
                $conn->close();
            } catch (Exception $e) {
                echo 'error';
                $allTestsPassed = false;
            }
        ?>">
            <h4>
                <i class="bi <?php
                    try {
                        require_once 'php/config.php';
                        $conn = getDBConnection();
                        echo 'bi-check-circle-fill status-icon"></i> Database Connection';
                        $conn->close();
                    } catch (Exception $e) {
                        echo 'bi-x-circle-fill status-icon"></i> Database Connection';
                    }
                ?>
            </h4>
            <?php
            try {
                require_once 'php/config.php';
                $conn = getDBConnection();
                echo '<p class="mb-1"><strong>Status:</strong> <span class="badge bg-success">✓ Connected</span></p>';
                echo '<p class="mb-1"><strong>Host:</strong> ' . DB_HOST . '</p>';
                echo '<p class="mb-1"><strong>Database:</strong> ' . DB_NAME . '</p>';
                
                // Check tables
                $result = $conn->query("SHOW TABLES");
                $tableCount = $result ? $result->num_rows : 0;
                echo '<p class="mb-0"><strong>Tables:</strong> ' . $tableCount . ' found</p>';
                
                if ($tableCount > 0) {
                    echo '<small class="text-muted">Tables: ';
                    $tables = [];
                    while ($row = $result->fetch_array()) {
                        $tables[] = $row[0];
                    }
                    echo implode(', ', $tables);
                    echo '</small>';
                }
                
                $conn->close();
            } catch (Exception $e) {
                echo '<p class="mb-1"><strong>Status:</strong> <span class="badge bg-danger">✗ Failed</span></p>';
                echo '<p class="mb-1"><strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</p>';
                echo '<div class="alert alert-warning mt-2">';
                echo '<strong>Solutions:</strong><br>';
                echo '1. Make sure MySQL is running in XAMPP<br>';
                echo '2. Check database credentials in php/config.php<br>';
                echo '3. Verify database user permissions';
                echo '</div>';
            }
            ?>
        </div>

        <!-- API Key Check -->
        <div class="test-item <?php
            $apiFile = 'js/api.js';
            if (file_exists($apiFile)) {
                $apiContent = file_get_contents($apiFile);
                if (preg_match("/const API_KEY = ['\"]([^'\"]+)['\"]/", $apiContent, $matches)) {
                    $apiKey = $matches[1];
                    if ($apiKey && $apiKey !== 'YOUR_API_KEY_HERE' && strlen($apiKey) > 10) {
                        echo 'success';
                    } else {
                        echo 'warning';
                    }
                } else {
                    echo 'warning';
                }
            } else {
                echo 'error';
            }
        ?>">
            <h4>
                <i class="bi <?php
                    $apiFile = 'js/api.js';
                    if (file_exists($apiFile)) {
                        $apiContent = file_get_contents($apiFile);
                        if (preg_match("/const API_KEY = ['\"]([^'\"]+)['\"]/", $apiContent, $matches)) {
                            $apiKey = $matches[1];
                            if ($apiKey && $apiKey !== 'YOUR_API_KEY_HERE' && strlen($apiKey) > 10) {
                                echo 'bi-check-circle-fill status-icon"></i> TMDB API Key';
                            } else {
                                echo 'bi-exclamation-triangle-fill status-icon"></i> TMDB API Key';
                            }
                        } else {
                            echo 'bi-exclamation-triangle-fill status-icon"></i> TMDB API Key';
                        }
                    } else {
                        echo 'bi-x-circle-fill status-icon"></i> TMDB API Key';
                    }
                ?>
            </h4>
            <?php
            $apiFile = 'js/api.js';
            if (file_exists($apiFile)) {
                $apiContent = file_get_contents($apiFile);
                if (preg_match("/const API_KEY = ['\"]([^'\"]+)['\"]/", $apiContent, $matches)) {
                    $apiKey = $matches[1];
                    if ($apiKey && $apiKey !== 'YOUR_API_KEY_HERE' && strlen($apiKey) > 10) {
                        echo '<p class="mb-1"><strong>Status:</strong> <span class="badge bg-success">✓ Configured</span></p>';
                        echo '<p class="mb-0"><small class="text-muted">Key: ' . substr($apiKey, 0, 8) . '...' . substr($apiKey, -4) . '</small></p>';
                    } else {
                        echo '<p class="mb-1"><strong>Status:</strong> <span class="badge bg-warning">⚠ Needs Configuration</span></p>';
                        echo '<p class="mb-0">Please set your API key in <code>js/api.js</code></p>';
                        echo '<p class="mb-0"><a href="api-setup.html" class="btn btn-sm btn-warning mt-2">Get API Key Guide</a></p>';
                    }
                } else {
                    echo '<p class="mb-1"><strong>Status:</strong> <span class="badge bg-warning">⚠ Not Found</span></p>';
                }
            } else {
                echo '<p class="mb-1"><strong>Status:</strong> <span class="badge bg-danger">✗ File Missing</span></p>';
                echo '<p class="mb-0">File <code>js/api.js</code> not found</p>';
            }
            ?>
        </div>

        <!-- File Permissions -->
        <div class="test-item <?php
            $phpDir = __DIR__ . '/php';
            $writable = is_writable($phpDir);
            echo $writable ? 'success' : 'warning';
        ?>">
            <h4>
                <i class="bi <?php
                    $phpDir = __DIR__ . '/php';
                    $writable = is_writable($phpDir);
                    echo $writable ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
                ?> status-icon"></i> File Permissions
            </h4>
            <p class="mb-1">
                PHP Directory: 
                <?php
                $phpDir = __DIR__ . '/php';
                $writable = is_writable($phpDir);
                if ($writable) {
                    echo '<span class="badge bg-success">✓ Writable</span>';
                } else {
                    echo '<span class="badge bg-warning">⚠ Check Permissions</span>';
                }
                ?>
            </p>
        </div>

        <!-- Session Test -->
        <div class="test-item success">
            <h4>
                <i class="bi bi-check-circle-fill status-icon"></i> Session Support
            </h4>
            <?php
            require_once 'php/session_manager.php';
            startSession();
            ?>
            <p class="mb-1"><strong>Status:</strong> <span class="badge bg-success">✓ Active</span></p>
            <p class="mb-0"><small class="text-muted">Session ID: <?php echo substr(session_id(), 0, 20); ?>...</small></p>
        </div>

        <!-- Summary -->
        <div class="alert <?php echo $allTestsPassed ? 'alert-success' : 'alert-warning'; ?> mt-4">
            <h5><i class="bi bi-info-circle"></i> Setup Status</h5>
            <?php if ($allTestsPassed): ?>
                <p class="mb-0"><strong>✓ Your website is ready to use!</strong> All critical components are configured correctly.</p>
            <?php else: ?>
                <p class="mb-0"><strong>⚠ Some issues detected.</strong> Please fix the errors above before using the website.</p>
            <?php endif; ?>
        </div>

        <!-- Quick Links -->
        <div class="quick-links">
            <a href="index.html" class="btn btn-primary">
                <i class="bi bi-house"></i> Homepage
            </a>
            <a href="php/test_connection.php" class="btn btn-info">
                <i class="bi bi-database"></i> Database Test
            </a>
            <a href="api-setup.html" class="btn btn-warning">
                <i class="bi bi-key"></i> API Setup Guide
            </a>
            <a href="signup.html" class="btn btn-success">
                <i class="bi bi-person-plus"></i> Sign Up
            </a>
            <a href="login.html" class="btn btn-secondary">
                <i class="bi bi-box-arrow-in-right"></i> Login
            </a>
        </div>

        <!-- Instructions -->
        <div class="mt-4">
            <h4><i class="bi bi-book"></i> Quick Start Instructions</h4>
            <ol>
                <li><strong>Start XAMPP:</strong> Make sure Apache and MySQL are running</li>
                <li><strong>Access Website:</strong> Go to <code>http://localhost/Cine_Flix/</code></li>
                <li><strong>Database:</strong> Will be created automatically on first access</li>
                <li><strong>Create Account:</strong> Sign up to start using the website</li>
            </ol>
        </div>
    </div>
</body>
</html>

