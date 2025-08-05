// DOM elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const loginBtn = document.getElementById('loginBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const signupLink = document.getElementById('signupLink');

// Validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Form validation functions
function validateEmail(email) {
    if (!email) {
        return 'Email is required';
    }
    if (!emailPattern.test(email)) {
        return 'Please enter a valid email address';
    }
    return '';
}

function validatePassword(password) {
    if (!password) {
        return 'Password is required';
    }
    if (password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    if (!passwordPattern.test(password)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return '';
}

// Show error message
function showError(element, message) {
    element.textContent = message;
    element.parentElement.querySelector('input').style.borderColor = '#e53e3e';
}

// Clear error message
function clearError(element) {
    element.textContent = '';
    element.parentElement.querySelector('input').style.borderColor = '#e2e8f0';
}

// Password visibility toggle
function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    const icon = togglePasswordBtn.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
}

// Loading state management
function setLoadingState(isLoading) {
    if (isLoading) {
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
    } else {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
    }
}

// Simulate login API call
async function simulateLogin(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate successful login for demo purposes
            // In a real application, this would be an actual API call
            if (email === 'admin@example.com' && password === 'Admin123!') {
                resolve({ success: true, message: 'Login successful!' });
            } else if (email === 'user@example.com' && password === 'User123!') {
                resolve({ success: true, message: 'Login successful!' });
            } else {
                resolve({ success: false, message: 'Invalid email or password' });
            }
        }, 2000); // 2 second delay to simulate network request
    });
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Clear previous errors
    clearError(emailError);
    clearError(passwordError);
    
    // Validate inputs
    const emailErrorMsg = validateEmail(email);
    const passwordErrorMsg = validatePassword(password);
    
    let hasErrors = false;
    
    if (emailErrorMsg) {
        showError(emailError, emailErrorMsg);
        hasErrors = true;
    }
    
    if (passwordErrorMsg) {
        showError(passwordError, passwordErrorMsg);
        hasErrors = true;
    }
    
    if (hasErrors) {
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        const result = await simulateLogin(email, password);
        
        if (result.success) {
            // Success - show success message and redirect
            showSuccessMessage(result.message);
            
            // In a real application, you would redirect to the dashboard
            // window.location.href = '/dashboard';
        } else {
            // Show error message
            showError(passwordError, result.message);
        }
    } catch (error) {
        showError(passwordError, 'An error occurred. Please try again.');
        console.error('Login error:', error);
    } finally {
        setLoadingState(false);
    }
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div style="
            background: #48bb78;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 500;
            animation: slideDown 0.3s ease-out;
        ">
            <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
            ${message}
        </div>
    `;
    
    loginForm.insertBefore(successDiv, loginForm.firstChild);
    
    // Remove success message after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Real-time validation
function setupRealTimeValidation() {
    emailInput.addEventListener('blur', () => {
        const email = emailInput.value.trim();
        const errorMsg = validateEmail(email);
        
        if (errorMsg) {
            showError(emailError, errorMsg);
        } else {
            clearError(emailError);
        }
    });
    
    passwordInput.addEventListener('blur', () => {
        const password = passwordInput.value;
        const errorMsg = validatePassword(password);
        
        if (errorMsg && password.length > 0) {
            showError(passwordError, errorMsg);
        } else if (password.length === 0) {
            clearError(passwordError);
        } else {
            clearError(passwordError);
        }
    });
    
    // Clear errors on input
    emailInput.addEventListener('input', () => {
        if (emailError.textContent) {
            clearError(emailError);
        }
    });
    
    passwordInput.addEventListener('input', () => {
        if (passwordError.textContent) {
            clearError(passwordError);
        }
    });
}

// Social login handlers
function handleGoogleLogin() {
    alert('Google login would be implemented here with OAuth 2.0');
    // In a real application, this would redirect to Google OAuth
    // window.location.href = '/auth/google';
}

function handleGithubLogin() {
    alert('GitHub login would be implemented here with OAuth');
    // In a real application, this would redirect to GitHub OAuth
    // window.location.href = '/auth/github';
}

// Forgot password handler
function handleForgotPassword(event) {
    event.preventDefault();
    const email = emailInput.value.trim();
    
    if (!email) {
        alert('Please enter your email address first');
        emailInput.focus();
        return;
    }
    
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address');
        emailInput.focus();
        return;
    }
    
    alert(`Password reset link would be sent to: ${email}`);
    // In a real application, this would make an API call to send reset email
}

// Signup link handler
function handleSignupLink(event) {
    event.preventDefault();
    alert('Signup page would be displayed here');
    // In a real application, this would redirect to signup page
    // window.location.href = '/signup';
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Enter key in email field moves to password field
        if (event.key === 'Enter' && document.activeElement === emailInput) {
            event.preventDefault();
            passwordInput.focus();
        }
        
        // Ctrl+Enter or Cmd+Enter submits the form
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
}

// Demo credentials display
function showDemoCredentials() {
    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-credentials';
    demoDiv.innerHTML = `
        <div style="
            background: rgba(102, 126, 234, 0.1);
            border: 1px solid rgba(102, 126, 234, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            font-size: 12px;
            color: #4a5568;
        ">
            <strong style="color: #667eea;">Demo Credentials:</strong><br>
            <strong>Admin:</strong> admin@example.com / Admin123!<br>
            <strong>User:</strong> user@example.com / User123!
        </div>
    `;
    
    loginForm.insertBefore(demoDiv, loginForm.firstChild);
}

// Initialize the application
function init() {
    // Event listeners
    loginForm.addEventListener('submit', handleSubmit);
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    
    // Social login buttons
    document.querySelector('.google-btn').addEventListener('click', handleGoogleLogin);
    document.querySelector('.github-btn').addEventListener('click', handleGithubLogin);
    
    // Forgot password link
    document.querySelector('.forgot-password').addEventListener('click', handleForgotPassword);
    
    // Signup link
    signupLink.addEventListener('click', handleSignupLink);
    
    // Setup real-time validation
    setupRealTimeValidation();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Show demo credentials
    showDemoCredentials();
    
    // Focus on email input
    emailInput.focus();
    
    // Add CSS animation for success message
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Auto-fill demo credentials (for development convenience)
function fillDemoCredentials() {
    emailInput.value = 'admin@example.com';
    passwordInput.value = 'Admin123!';
}

// Add double-click to auto-fill (for demo purposes)
loginForm.addEventListener('dblclick', fillDemoCredentials);

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export functions for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmail,
        validatePassword,
        handleSubmit
    };
}