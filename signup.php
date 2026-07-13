<?php
// Redirect if already logged in
require_once 'php/session_manager.php';
require_once 'php/cookie_manager.php';
startSession();
maintainSession();

if (isLoggedIn()) {
    header("Location: index.php?success=You are already logged in!");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up - CineFlix</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="css/style.css">
    <style>
        .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 0;
        }
        .auth-card {
            background: rgba(20, 25, 40, 0.95);
            border: 1px solid var(--primary-color);
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 255, 255, 0.1);
            padding: 2.5rem;
            max-width: 500px;
            width: 100%;
            animation: modalSlideIn 0.3s ease-out;
        }
        .auth-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .auth-header h2 {
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        .auth-header p {
            color: rgba(255, 255, 255, 0.7);
        }
        .form-label {
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
        }
        .form-control {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            color: white;
        }
        .form-control:focus {
            background: rgba(255, 255, 255, 0.15);
            border-color: var(--primary-color);
            color: white;
            box-shadow: 0 0 0 0.2rem rgba(0, 255, 255, 0.25);
        }
        .form-check-label {
            color: rgba(255, 255, 255, 0.8);
        }
        .auth-link {
            color: var(--primary-color);
            text-decoration: none;
        }
        .auth-link:hover {
            color: var(--accent-color);
            text-decoration: underline;
        }
        .password-strength {
            font-size: 0.85rem;
            margin-top: 0.25rem;
        }
        .password-strength.weak { color: #ff6b6b; }
        .password-strength.medium { color: #ffa500; }
        .password-strength.strong { color: #51cf66; }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h2><i class="bi bi-film"></i> CineFlix</h2>
                <p>Create your account</p>
            </div>

            <!-- Error Messages -->
            <div id="errorAlert" class="alert alert-danger alert-dismissible fade show d-none" role="alert">
                <i class="bi bi-exclamation-triangle"></i> <span id="errorMessage"></span>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            
            <!-- Success Messages -->
            <div id="successAlert" class="alert alert-success alert-dismissible fade show d-none" role="alert">
                <i class="bi bi-check-circle"></i> <span id="successMessage"></span>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>

            <form action="php/signup.php" method="POST" id="signupForm">
                <div class="mb-3">
                    <label for="name" class="form-label">
                        <i class="bi bi-person"></i> Full Name
                    </label>
                    <input type="text" class="form-control" id="name" name="name" required 
                           placeholder="Enter your full name" autocomplete="name">
                </div>

                <div class="mb-3">
                    <label for="email" class="form-label">
                        <i class="bi bi-envelope"></i> Email Address
                    </label>
                    <input type="email" class="form-control" id="email" name="email" required 
                           placeholder="Enter your email" autocomplete="email">
                </div>

                <div class="mb-3">
                    <label for="password" class="form-label">
                        <i class="bi bi-lock"></i> Password
                    </label>
                    <input type="password" class="form-control" id="password" name="password" required 
                           placeholder="Create a password" autocomplete="new-password" minlength="6">
                    <div id="passwordStrength" class="password-strength"></div>
                </div>

                <div class="mb-3">
                    <label for="confirm_password" class="form-label">
                        <i class="bi bi-lock-fill"></i> Confirm Password
                    </label>
                    <input type="password" class="form-control" id="confirm_password" name="confirm_password" required 
                           placeholder="Confirm your password" autocomplete="new-password">
                    <div id="passwordMatch" class="password-strength"></div>
                </div>

                <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="terms" name="terms" required>
                    <label class="form-check-label" for="terms">
                        I agree to the <a href="#" class="auth-link">Terms & Conditions</a>
                    </label>
                </div>

                <button type="submit" class="btn btn-primary w-100 mb-3">
                    <i class="bi bi-person-plus"></i> Create Account
                </button>

                <div class="text-center">
                    <p class="mb-0">
                        Already have an account? 
                        <a href="login.php" class="auth-link">Sign in here</a>
                    </p>
                    <p class="mt-2 mb-0">
                        <a href="index.php" class="auth-link">
                            <i class="bi bi-arrow-left"></i> Back to Home
                        </a>
                    </p>
                </div>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Display error/success messages from URL parameters
        (function() {
            const urlParams = new URLSearchParams(window.location.search);
            const error = urlParams.get('error');
            const success = urlParams.get('success');
            
            if (error) {
                const errorAlert = document.getElementById('errorAlert');
                const errorMessage = document.getElementById('errorMessage');
                errorMessage.textContent = decodeURIComponent(error);
                errorAlert.classList.remove('d-none');
            }
            
            if (success) {
                const successAlert = document.getElementById('successAlert');
                const successMessage = document.getElementById('successMessage');
                successMessage.textContent = decodeURIComponent(success);
                successAlert.classList.remove('d-none');
            }
        })();

        // Password strength checker
        const passwordInput = document.getElementById('password');
        const passwordStrength = document.getElementById('passwordStrength');
        const confirmPasswordInput = document.getElementById('confirm_password');
        const passwordMatch = document.getElementById('passwordMatch');

        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            let text = '';

            if (password.length >= 6) strength++;
            if (password.length >= 8) strength++;
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^a-zA-Z0-9]/.test(password)) strength++;

            if (password.length === 0) {
                text = '';
            } else if (strength <= 2) {
                text = 'Weak password';
                passwordStrength.className = 'password-strength weak';
            } else if (strength <= 3) {
                text = 'Medium password';
                passwordStrength.className = 'password-strength medium';
            } else {
                text = 'Strong password';
                passwordStrength.className = 'password-strength strong';
            }

            passwordStrength.textContent = text;
        });

        // Password match checker
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value === '') {
                passwordMatch.textContent = '';
                return;
            }

            if (this.value === passwordInput.value) {
                passwordMatch.textContent = '✓ Passwords match';
                passwordMatch.className = 'password-strength strong';
            } else {
                passwordMatch.textContent = '✗ Passwords do not match';
                passwordMatch.className = 'password-strength weak';
            }
        });

        // Form validation
        document.getElementById('signupForm').addEventListener('submit', function(e) {
            if (passwordInput.value !== confirmPasswordInput.value) {
                e.preventDefault();
                alert('Passwords do not match!');
                return false;
            }

            if (passwordInput.value.length < 6) {
                e.preventDefault();
                alert('Password must be at least 6 characters long!');
                return false;
            }
        });
    </script>
</body>
</html>

