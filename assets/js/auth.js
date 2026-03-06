// Authentication logic using Supabase

document.addEventListener('DOMContentLoaded', () => {

    // UI Feedback Helpers
    const showMessage = (elementId, message, isError = false) => {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = message;
            el.style.display = 'block';
            el.style.color = isError ? '#ef4444' : '#22c55e'; // Red for error, Green for success
            el.style.padding = '10px';
            el.style.borderRadius = '6px';
            el.style.backgroundColor = isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)';
            el.style.marginBottom = '16px';
            el.style.fontSize = '0.9rem';
            el.style.textAlign = 'center';
            if (!isError) {
                setTimeout(() => {
                    el.style.display = 'none';
                }, 3000)
            }
        }
    };

    // --- Signup Flow ---
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const submitBtn = signupForm.querySelector('button[type="submit"]');

            // Basic validation
            if (password !== confirmPassword) {
                showMessage('auth-message', 'Passwords do not match', true);
                return;
            }

            if (password.length < 6) {
                showMessage('auth-message', 'Password must be at least 6 characters long', true);
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';

            try {
                // Call Supabase SignUp
                const { data, error } = await window.supabaseClient.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: name,
                        }
                    }
                });

                if (error) throw error;

                // Check if session exists (email confirmation might be required)
                if (data.session) {
                    showMessage('auth-message', 'Account created successfully! Welcome to MediEase.', false);

                    // Redirect on success
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    showMessage('auth-message', 'Account created! Please check your email for a confirmation link (or disable Email Confirmations in Supabase dashboard).', false);
                    // Do not redirect, keep them on the signup page or let them go to login
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Sign Up';
                }

            } catch (error) {
                showMessage('auth-message', error.message, true);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign Up';
            }
        });
    }

    // --- Login Flow ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging In...';

            try {
                // Call Supabase SignIn
                const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) throw error;

                // Redirect to dashboard on success
                window.location.href = 'dashboard.html';

            } catch (error) {
                showMessage('auth-message', error.message, true);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        });
    }

    // --- Dashboard Protection & User Info ---
    // If we are on the dashboard, verify the session
    const isDashboard = window.location.pathname.includes('dashboard.html');
    if (isDashboard) {
        checkSession();
    }

    async function checkSession() {
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();

        if (error || !session) {
            // No active session, redirect to login
            window.location.href = 'login.html';
        } else {
            // Populate user info if elements exist
            const user = session.user;
            const fullName = user.user_metadata?.full_name || user.email;
            const profileIcons = document.querySelectorAll('.profile-icon');

            // Update Topbar and Sidebar Profile text
            const sidebarName = document.querySelector('.sidebar-user-profile .user-details span:first-child');
            const dashboardWelcome = document.querySelector('.welcome-section h1');
            const profileName = document.querySelector('#profile h1');
            const profileEmail = document.querySelector('#profile p');

            if (sidebarName) sidebarName.textContent = fullName;
            if (dashboardWelcome) {
                // Extract first name for welcome
                const firstName = fullName.split(' ')[0];
                dashboardWelcome.textContent = `Good Evening, ${firstName}! 👋`;
            }
            if (profileName) profileName.textContent = fullName;
            if (profileEmail) profileEmail.textContent = `✉ ${user.email}`;

            // Update avatars
            const initial = fullName.charAt(0).toUpperCase();
            profileIcons.forEach(icon => {
                icon.textContent = initial;
            });
        }
    }

    // --- Logout Flow ---
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const { error } = await window.supabaseClient.auth.signOut();
                if (error) throw error;
                // Redirect to index page upon logout
                window.location.href = 'index.html';
            } catch (error) {
                console.error("Error logging out:", error.message);
                alert("Failed to log out. Please try again.");
            }
        });
    });
});
