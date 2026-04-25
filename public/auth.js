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

            checkNotifications(nav);

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

            checkNotifications(nav);

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
        console.error('Auth check failed:', e);
    }
});

async function checkNotifications(nav) {
    try {
        const res = await fetch('/api/get-notifications');
        const data = await res.json();
        
        if (data.success && data.notifications.length > 0) {
            const notif = document.createElement('div');
            notif.className = 'auth-link notification-bell';
            notif.style.cssText = 'position: relative; color: #f59e0b; padding: 8px; cursor: pointer; display: flex; align-items: center; z-index: 100;';
            notif.innerHTML = `
                <i class="fas fa-bell"></i>
                <span style="position: absolute; top: 5px; right: 5px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 2px solid #000;"></span>
            `;
            
            // Create Dropdown
            const dropdown = document.createElement('div');
            dropdown.style.cssText = 'display: none; position: absolute; top: 100%; right: 0; width: 300px; background: rgba(20, 20, 20, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); transform-origin: top right; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0; transform: scale(0.95);';
            
            dropdown.innerHTML = `
                <div style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                    Notifications
                </div>
                ${data.notifications.map(n => `
                    <div style="font-size: 0.8rem; color: #d2d2d7; margin-bottom: 12px; line-height: 1.4;">
                        <span style="color: #3b82f6; margin-right: 5px;">•</span> ${n.message}
                    </div>
                `).join('')}
                <button id="dismiss-notifs" style="width: 100%; padding: 8px; margin-top: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #86868b; border-radius: 6px; cursor: pointer; font-size: 0.75rem; transition: 0.2s;">
                    Dismiss All
                </button>
            `;

            notif.appendChild(dropdown);

            let isOpen = false;
            notif.onclick = (e) => {
                // Prevent bubbling so document click doesn't immediately close it
                if (e.target.id === 'dismiss-notifs') return;
                
                isOpen = !isOpen;
                if (isOpen) {
                    dropdown.style.display = 'block';
                    // Trigger reflow
                    void dropdown.offsetWidth;
                    dropdown.style.opacity = '1';
                    dropdown.style.transform = 'scale(1)';
                } else {
                    dropdown.style.opacity = '0';
                    dropdown.style.transform = 'scale(0.95)';
                    setTimeout(() => dropdown.style.display = 'none', 300);
                }
            };

            dropdown.querySelector('#dismiss-notifs').onclick = () => {
                notif.remove();
            };

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (isOpen && !notif.contains(e.target)) {
                    isOpen = false;
                    dropdown.style.opacity = '0';
                    dropdown.style.transform = 'scale(0.95)';
                    setTimeout(() => dropdown.style.display = 'none', 300);
                }
            });

            nav.insertBefore(notif, nav.firstChild);
        }
    } catch (e) {}
}
