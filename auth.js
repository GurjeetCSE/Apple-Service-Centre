// ============================================
// Auth UI Handler - Updates nav based on login state
// Include this script on every page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/user');
        const data = await res.json();
        const nav = document.querySelector('nav');
        if (!nav) return;

        // Update elements that need the user's name
        if (data.loggedIn) {
            document.querySelectorAll('.user-name').forEach(el => {
                el.textContent = data.user.name;
            });
            document.querySelectorAll('.logged-in-only').forEach(el => {
                el.style.display = 'block';
            });
            document.querySelectorAll('.logged-out-only').forEach(el => {
                el.style.display = 'none';
            });
        } else {
            document.querySelectorAll('.logged-in-only').forEach(el => {
                el.style.display = 'none';
            });
            document.querySelectorAll('.logged-out-only').forEach(el => {
                el.style.display = 'block';
            });
        }

        // Remove existing auth links
        nav.querySelectorAll('.auth-link').forEach(el => el.remove());

        if (data.loggedIn) {
            // Show user greeting (linked to profile) + logout
            const greeting = document.createElement('a');
            greeting.href = 'profile.html';
            greeting.className = 'auth-link';
            greeting.style.cssText = 'color: #60a5fa; font-size: 0.88rem; font-weight: 500; padding: 8px 12px; display: flex; align-items: center; gap: 6px; text-decoration: none;';
            greeting.innerHTML = `<span style="width:8px;height:8px;background:#34d399;border-radius:50%;display:inline-block;"></span> ${data.user.name}`;
            nav.appendChild(greeting);

            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.className = 'auth-link';
            logoutLink.textContent = 'Logout';
            logoutLink.style.color = '#f87171';
            logoutLink.onclick = async (e) => {
                e.preventDefault();
                await fetch('/api/logout');
                window.location.href = 'index.html';
            };
            nav.appendChild(logoutLink);
        } else {
            // Show login + signup
            const loginLink = document.createElement('a');
            loginLink.href = 'login.html';
            loginLink.className = 'auth-link';
            loginLink.textContent = 'Login';
            nav.appendChild(loginLink);

            const signupLink = document.createElement('a');
            signupLink.href = 'signup.html';
            signupLink.className = 'auth-link';
            signupLink.style.cssText = 'background: linear-gradient(135deg, #2563eb, #3b82f6); color: #fff; border-radius: 8px; padding: 8px 18px !important;';
            signupLink.textContent = 'Sign Up';
            nav.appendChild(signupLink);
        }
    } catch (e) {
        // If server is not running (static file mode), just ignore
    }
});
