<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CineFlix - Create Database Tables</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .setup-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .status-item {
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #ddd;
        }
        .status-item.success {
            background: #d4edda;
            border-left-color: #28a745;
        }
        .status-item.error {
            background: #f8d7da;
            border-left-color: #dc3545;
        }
        .status-item.info {
            background: #d1ecf1;
            border-left-color: #17a2b8;
        }
    </style>
</head>
<body>
    <div class="setup-container">
        <div class="text-center mb-4">
            <h1 class="display-4"><i class="bi bi-database"></i> CineFlix</h1>
            <h2>Database Tables Setup</h2>
            <p class="lead">Creating all required tables...</p>
        </div>

        <?php
        error_reporting(E_ALL);
        ini_set('display_errors', 1);

        require_once 'php/config.php';

        $results = [];
        $allSuccess = true;

        try {
            // Connect to database
            $conn = getDBConnection();
            
            if ($conn->connect_error) {
                throw new Exception("Connection failed: " . $conn->connect_error);
            }

            echo '<div class="status-item info">';
            echo '<h5><i class="bi bi-info-circle"></i> Connected to Database</h5>';
            echo '<p>Database: <strong>' . DB_NAME . '</strong></p>';
            echo '</div>';

            // Create users table
            echo '<div class="status-item">';
            echo '<h5><i class="bi bi-arrow-right-circle"></i> Creating users table...</h5>';
            $sql = "CREATE TABLE IF NOT EXISTS `users` (
                `id` INT(11) NOT NULL AUTO_INCREMENT,
                `name` VARCHAR(100) NOT NULL,
                `email` VARCHAR(100) NOT NULL,
                `password` VARCHAR(255) NOT NULL,
                `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                `last_login` TIMESTAMP NULL DEFAULT NULL,
                `last_login_ip` VARCHAR(45) NULL DEFAULT NULL,
                `last_login_user_agent` TEXT NULL DEFAULT NULL,
                `login_count` INT(11) NOT NULL DEFAULT 0,
                PRIMARY KEY (`id`),
                UNIQUE KEY `email` (`email`),
                KEY `idx_email` (`email`),
                KEY `idx_last_login` (`last_login`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
            
            if ($conn->query($sql)) {
                echo '<p class="text-success"><strong>✓ Success!</strong> users table created/verified</p>';
                $results['users'] = true;
            } else {
                echo '<p class="text-danger"><strong>✗ Error:</strong> ' . $conn->error . '</p>';
                $results['users'] = false;
                $allSuccess = false;
            }
            echo '</div>';

            // Create login_history table
            echo '<div class="status-item">';
            echo '<h5><i class="bi bi-arrow-right-circle"></i> Creating login_history table...</h5>';
            $sql = "CREATE TABLE IF NOT EXISTS `login_history` (
                `id` INT(11) NOT NULL AUTO_INCREMENT,
                `user_id` INT(11) NOT NULL,
                `login_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `ip_address` VARCHAR(45) NULL DEFAULT NULL,
                `user_agent` TEXT NULL DEFAULT NULL,
                `login_status` ENUM('success', 'failed') NOT NULL DEFAULT 'success',
                PRIMARY KEY (`id`),
                KEY `idx_user_id` (`user_id`),
                KEY `idx_login_time` (`login_time`),
                CONSTRAINT `fk_login_history_user` FOREIGN KEY (`user_id`) 
                    REFERENCES `users` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
            
            if ($conn->query($sql)) {
                echo '<p class="text-success"><strong>✓ Success!</strong> login_history table created/verified</p>';
                $results['login_history'] = true;
            } else {
                echo '<p class="text-danger"><strong>✗ Error:</strong> ' . $conn->error . '</p>';
                $results['login_history'] = false;
                $allSuccess = false;
            }
            echo '</div>';

            // Create user_movies table
            echo '<div class="status-item">';
            echo '<h5><i class="bi bi-arrow-right-circle"></i> Creating user_movies table...</h5>';
            $sql = "CREATE TABLE IF NOT EXISTS `user_movies` (
                `id` INT(11) NOT NULL AUTO_INCREMENT,
                `user_id` INT(11) NOT NULL,
                `movie_id` INT(11) NOT NULL,
                `added_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`),
                UNIQUE KEY `unique_user_movie` (`user_id`, `movie_id`),
                KEY `idx_user_id` (`user_id`),
                KEY `idx_movie_id` (`movie_id`),
                CONSTRAINT `fk_user_movies_user` FOREIGN KEY (`user_id`) 
                    REFERENCES `users` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
            
            if ($conn->query($sql)) {
                echo '<p class="text-success"><strong>✓ Success!</strong> user_movies table created/verified</p>';
                $results['user_movies'] = true;
            } else {
                echo '<p class="text-danger"><strong>✗ Error:</strong> ' . $conn->error . '</p>';
                $results['user_movies'] = false;
                $allSuccess = false;
            }
            echo '</div>';

            // Show all tables
            echo '<div class="status-item info">';
            echo '<h5><i class="bi bi-list-ul"></i> Database Tables Summary</h5>';
            $result = $conn->query("SHOW TABLES");
            if ($result && $result->num_rows > 0) {
                echo '<ul class="list-group">';
                while ($row = $result->fetch_array()) {
                    $tableName = $row[0];
                    // Get row count
                    $countResult = $conn->query("SELECT COUNT(*) as count FROM `$tableName`");
                    $count = $countResult ? $countResult->fetch_assoc()['count'] : 0;
                    echo '<li class="list-group-item d-flex justify-content-between align-items-center">';
                    echo '<span><i class="bi bi-table"></i> <strong>' . $tableName . '</strong></span>';
                    echo '<span class="badge bg-primary rounded-pill">' . $count . ' rows</span>';
                    echo '</li>';
                }
                echo '</ul>';
            } else {
                echo '<p class="text-warning">No tables found</p>';
            }
            echo '</div>';

            $conn->close();

        } catch (Exception $e) {
            echo '<div class="status-item error">';
            echo '<h5><i class="bi bi-x-circle"></i> Error</h5>';
            echo '<p><strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</p>';
            echo '<p>Please make sure:</p>';
            echo '<ul>';
            echo '<li>MySQL is running in XAMPP</li>';
            echo '<li>Database "cineflix_db" exists</li>';
            echo '<li>Database credentials are correct in php/config.php</li>';
            echo '</ul>';
            echo '</div>';
            $allSuccess = false;
        }
        ?>

        <!-- Summary -->
        <div class="alert <?php echo $allSuccess ? 'alert-success' : 'alert-warning'; ?> mt-4">
            <h5><i class="bi bi-<?php echo $allSuccess ? 'check-circle' : 'exclamation-triangle'; ?>"></i> Setup Status</h5>
            <?php if ($allSuccess): ?>
                <p class="mb-0"><strong>✓ All tables created successfully!</strong> Your database is ready to use.</p>
            <?php else: ?>
                <p class="mb-0"><strong>⚠ Some errors occurred.</strong> Please check the errors above and try again.</p>
            <?php endif; ?>
        </div>

        <!-- Quick Links -->
        <div class="d-flex gap-2 flex-wrap mt-4">
            <a href="setup.php" class="btn btn-primary">
                <i class="bi bi-gear"></i> Setup Page
            </a>
            <a href="php/test_connection.php" class="btn btn-info">
                <i class="bi bi-database"></i> Test Connection
            </a>
            <a href="index.php" class="btn btn-success">
                <i class="bi bi-house"></i> Homepage
            </a>
            <a href="signup.php" class="btn btn-secondary">
                <i class="bi bi-person-plus"></i> Sign Up
            </a>
        </div>
    </div>
</body>
</html>

