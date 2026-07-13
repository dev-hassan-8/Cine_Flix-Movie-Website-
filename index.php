<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CineFlix - Your Movie Destination</title>
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
                        <a class="nav-link " href="index.php">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="movies.php">Movies</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="my-list.php">My List</a>
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

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="hero-content">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-6">
                        <h1 class="display-4 fw-bold text-white mb-4">Welcome to CineFlix</h1>
                        <p class="lead text-white mb-4">Discover, watch, and organize your favorite movies in one place.</p>
                        <div class="d-flex gap-3 flex-wrap">
                            <a href="movies.php" class="btn btn-primary btn-lg">Explore Movies</a>
                        </div>
                        <div id="successAlert" class="alert alert-success alert-dismissible fade show mt-3 d-none" role="alert">
                            <i class="bi bi-check-circle"></i> <span id="successMessage"></span>
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div id="heroMovies" class="hero-movies-container">
                            <!-- Featured movies will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Featured Movies Section -->
    <section class="py-5 mt-5">
        <div class="container">
            <h2 class="text-center mb-5">Trending Movies</h2>
            <div id="featuredMovies" class="row g-4">
                <!-- Movies will be loaded here -->
            </div>
        </div>
    </section>

    <!-- Top Rated Movies Section -->
    <section class="py-5">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0">Top Rated Movies</h2>
                <a href="movies.html?filter=top_rated" class="btn btn-outline-primary">
                    View All <i class="bi bi-arrow-right"></i>
                </a>
            </div>
            <div id="topRatedMovies" class="row g-4">
                <!-- Movies will be loaded here -->
            </div>
        </div>
    </section>

    <!-- Now Playing Movies Section -->
    <section class="py-5">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0">Now Playing</h2>
                <a href="movies.html?filter=now_playing" class="btn btn-outline-primary">
                    View All <i class="bi bi-arrow-right"></i>
                </a>
            </div>
            <div id="nowPlayingMovies" class="row g-4">
                <!-- Movies will be loaded here -->
            </div>
        </div>
    </section>

    <!-- Upcoming Movies Section -->
    <section class="py-5">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0">Upcoming Movies</h2>
                <a href="movies.html?filter=upcoming" class="btn btn-outline-primary">
                    View All <i class="bi bi-arrow-right"></i>
                </a>
            </div>
            <div id="upcomingMovies" class="row g-4">
                <!-- Movies will be loaded here -->
            </div>
        </div>
    </section>

    <!-- Must Watch Section -->
    <section class="py-5">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0">Must Watch</h2>
                <a href="movies.html?filter=top_rated" class="btn btn-outline-primary">
                    View All <i class="bi bi-arrow-right"></i>
                </a>
            </div>
            <div id="mustWatchMovies" class="row g-4">
                <!-- Movies will be loaded here -->
            </div>
        </div>
    </section>

    <!-- Fan Favorites Section -->
    <section class="py-5">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0">Fan Favorites</h2>
                <a href="movies.html?filter=popular" class="btn btn-outline-primary">
                    View All <i class="bi bi-arrow-right"></i>
                </a>
            </div>
            <div id="fanFavoritesMovies" class="row g-4">
                <!-- Movies will be loaded here -->
            </div>
        </div>
    </section>

    <!-- Critics' Choice Section -->
    <section class="py-5">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0">Critics' Choice</h2>
                <a href="movies.html?filter=top_rated" class="btn btn-outline-primary">
                    View All <i class="bi bi-arrow-right"></i>
                </a>
            </div>
            <div id="criticsChoiceMovies" class="row g-4">
                <!-- Movies will be loaded here -->
            </div>
        </div>
    </section>

    <!-- Trending Now Section -->
    <section class="py-5">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0">Trending Now</h2>
                <a href="movies.html?filter=now_playing" class="btn btn-outline-primary">
                    View All <i class="bi bi-arrow-right"></i>
                </a>
            </div>
            <div id="trendingNowMovies" class="row g-4">
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
                        Explore and watch thousands of full movies in one place.
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

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/api.js?v=<?php echo time(); ?>"></script>
    <script src="js/auth.js?v=<?php echo time(); ?>"></script>
    <script src="js/download.js?v=<?php echo time(); ?>"></script>
    <script src="js/cookie-consent.js?v=<?php echo time(); ?>"></script>
    <script src="js/main.js?v=<?php echo time(); ?>"></script>
    <script>
        // Ensure dropdown works properly
        document.addEventListener('DOMContentLoaded', function() {
            const dropdownToggle = document.getElementById('userDropdown');
            const dropdownMenu = dropdownToggle?.nextElementSibling;
            
            if (dropdownToggle && dropdownMenu) {
                // Initialize Bootstrap dropdown
                const dropdown = new bootstrap.Dropdown(dropdownToggle);
                
                // Ensure dropdown items are visible
                dropdownToggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    dropdown.toggle();
                });
                
                // Make sure dropdown menu is visible when shown
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

