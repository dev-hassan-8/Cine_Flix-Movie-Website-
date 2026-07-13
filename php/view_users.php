<?php
/**
 * View Users and Login History
 * Admin page to view all users and their login details
 */

require_once 'config.php';
require_once 'session_manager.php';

// Start session
startSession();

// Check if user is logged in (optional: add admin check)
if (!isLoggedIn()) {
    header("Location: ../login.php?error=Please login to view this page");
    exit();
}

try {
    $conn = getDBConnection();
    
    // Get all users
    $usersQuery = "SELECT id, name, email, created_at, last_login, last_login_ip, login_count 
                   FROM users 
                   ORDER BY created_at DESC";
    $usersResult = $conn->query($usersQuery);
    
    // Get login history
    $historyQuery = "SELECT lh.*, u.name, u.email 
                     FROM login_history lh 
                     LEFT JOIN users u ON lh.user_id = u.id 
                     ORDER BY lh.login_time DESC 
                     LIMIT 50";
    $historyResult = $conn->query($historyQuery);
    
} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Management - CineFlix</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        body {
            background: #0a0e27;
            color: white;
            padding: 2rem 0;
        }
        .table-dark {
            background: #15182e;
        }
        .badge-success { background: #00d4ff; }
        .badge-danger { background: #ff6b35; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="mb-4"><i class="bi bi-people"></i> User Management</h1>
        
        <div class="row mb-4">
            <div class="col-md-12">
                <a href="../index.php" class="btn btn-primary mb-3">
                    <i class="bi bi-arrow-left"></i> Back to Home
                </a>
            </div>
        </div>
        
        <!-- Users Table -->
        <div class="card bg-dark mb-4">
            <div class="card-header">
                <h3><i class="bi bi-people-fill"></i> All Users (<?php echo $usersResult->num_rows; ?>)</h3>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-dark table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Created At</th>
                                <th>Last Login</th>
                                <th>Last IP</th>
                                <th>Login Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php while ($user = $usersResult->fetch_assoc()): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($user['id']); ?></td>
                                    <td><?php echo htmlspecialchars($user['name']); ?></td>
                                    <td><?php echo htmlspecialchars($user['email']); ?></td>
                                    <td><?php echo $user['created_at'] ? date('Y-m-d H:i', strtotime($user['created_at'])) : 'N/A'; ?></td>
                                    <td><?php echo $user['last_login'] ? date('Y-m-d H:i', strtotime($user['last_login'])) : 'Never'; ?></td>
                                    <td><?php echo htmlspecialchars($user['last_login_ip'] ?? 'N/A'); ?></td>
                                    <td><span class="badge bg-primary"><?php echo $user['login_count'] ?? 0; ?></span></td>
                                </tr>
                            <?php endwhile; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Login History -->
        <div class="card bg-dark">
            <div class="card-header">
                <h3><i class="bi bi-clock-history"></i> Recent Login History (Last 50)</h3>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-dark table-striped">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>IP Address</th>
                                <th>Status</th>
                                <th>User Agent</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php while ($history = $historyResult->fetch_assoc()): ?>
                                <tr>
                                    <td><?php echo date('Y-m-d H:i:s', strtotime($history['login_time'])); ?></td>
                                    <td><?php echo htmlspecialchars($history['name'] ?? 'Unknown'); ?></td>
                                    <td><?php echo htmlspecialchars($history['email'] ?? 'N/A'); ?></td>
                                    <td><?php echo htmlspecialchars($history['ip_address'] ?? 'N/A'); ?></td>
                                    <td>
                                        <?php if ($history['login_status'] == 'success'): ?>
                                            <span class="badge bg-success">Success</span>
                                        <?php else: ?>
                                            <span class="badge bg-danger">Failed</span>
                                        <?php endif; ?>
                                    </td>
                                    <td><small><?php echo htmlspecialchars(substr($history['user_agent'] ?? 'N/A', 0, 50)); ?>...</small></td>
                                </tr>
                            <?php endwhile; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
<?php
$conn->close();
?>

