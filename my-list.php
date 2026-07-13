<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My List - CineFlix</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="css/style.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" href="css/cookie-consent.css?v=<?php echo time(); ?>">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div class="container">
            <a class="navbar-brand" href="index.php">
                <i class="bi bi-film"></i> CineFlix
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="index.php">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="movies.php">Movies</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="my-list.php">My List</a>
                    </li>
                    <?php 
                    require_once 'php/session_manager.php';
                    require_once 'php/cookie_manager.php';
                    startSession();
                    maintainSession();
                    $isLoggedIn = isLoggedIn();
                    $userData = getUserData();
                    if ($isLoggedIn && $userData): ?>
                        <li class="nav-item">
                            <span class="nav-link">
                                <i class="bi bi-person-circle"></i> <span id="userNameDisplay"><?php echo htmlspecialchars($userData['name']); ?></span>
                            </span>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="php/logout.php" title="Logout">
                                <i class="bi bi-box-arrow-right"></i> Logout
                            </a>
                        </li>
                    <?php else: ?>
                        <!-- Login and Sign Up buttons - only shown when NOT logged in -->
                        <li class="nav-item">
                            <a class="nav-link" href="login.php"><i class="bi bi-box-arrow-in-right"></i> Login</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="signup.php"><i class="bi bi-person-plus"></i> Sign Up</a>
                        </li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>
    </nav>

    <!-- My List Section -->
    <section class="py-5 mt-5">
        <div class="container">
            <h2 class="text-center mb-5">My Movie List</h2>
            <div id="emptyList" class="text-center py-5 d-none">
                <i class="bi bi-inbox" style="font-size: 4rem; color: #6c757d;"></i>
                <h4 class="mt-3">Your list is empty</h4>
                <p>Start adding movies to your list to watch them later!</p>
                <a href="movies.php" class="btn btn-primary mt-3">Browse Movies</a>
            </div>
            <div id="myListGrid" class="row g-4">
                <!-- Movies will be loaded here -->
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer-section mt-5">
        <div class="container py-5">
            <div class="row">
                <div class="col-lg-4 col-md-6 mb-4">
                    <h5 class="footer-brand mb-3">
                        <i class="bi bi-film"></i> CineFlix
                    </h5>
                    <p class="footer-text">
                        Your ultimate destination for discovering, watching, and organizing your favorite movies. 
                        Explore thousands of movies and trailers in one place.
                    </p>
                    <div class="social-links mt-3">
                        <a href="#" class="social-link me-3" title="Facebook">
                            <i class="bi bi-facebook"></i>
                        </a>
                        <a href="#" class="social-link me-3" title="Twitter">
                            <i class="bi bi-twitter"></i>
                        </a>
                        <a href="#" class="social-link me-3" title="Instagram">
                            <i class="bi bi-instagram"></i>
                        </a>
                        <a href="#" class="social-link" title="YouTube">
                            <i class="bi bi-youtube"></i>
                        </a>
                    </div>
                </div>
                <div class="col-lg-2 col-md-6 mb-4">
                    <h6 class="footer-title mb-3">Quick Links</h6>
                    <ul class="footer-links">
                        <li><a href="index.php">Home</a></li>
                        <li><a href="movies.php">Movies</a></li>
                        <li><a href="my-list.php">My List</a></li>
                    </ul>
                </div>
                <div class="col-lg-3 col-md-6 mb-4">
                    <h6 class="footer-title mb-3">Categories</h6>
                    <ul class="footer-links">
                        <li><a href="movies.php?filter=popular">Popular Movies</a></li>
                        <li><a href="movies.php?filter=top_rated">Top Rated</a></li>
                        <li><a href="movies.php?filter=now_playing">Now Playing</a></li>
                        <li><a href="movies.php?filter=upcoming">Upcoming</a></li>
                    </ul>
                </div>
                <div class="col-lg-3 col-md-6 mb-4">
                    <h6 class="footer-title mb-3">About</h6>
                    <ul class="footer-links">
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Service</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </div>
            </div>
            <hr class="footer-divider">
            <div class="row">
                <div class="col-md-6 text-center text-md-start mb-2">
                    <p class="footer-copyright mb-0">
                        &copy; 2025 CineFlix. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Movie Modal -->
    <div class="modal fade" id="movieModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content bg-dark text-white">
                <div class="modal-header border-secondary">
                    <h5 class="modal-title" id="movieModalTitle">Movie Details</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="movieModalBody">
            const dropdownToggle = document.getElementById('userDropdown');
            const dropdownMenu = dropdownToggle?.nextElementSibling;
            
            if (dropdownToggle && dropdownMenu) {
                const dropdown = new bootstrap.Dropdown(dropdownToggle);
                dropdownToggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    dropdown.toggle();
                });
                dropdownToggle.addEventListener('shown.bs.dropdown', function() {
                    dropdownMenu.style.display = 'block';
                    dropdownMenu.style.opacity = '1';
                    dropdownMenu.style.visibility = 'visible';
                });
            }
        });
    </script>
</body>
</html>

