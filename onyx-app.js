/* ============================================================
   ONYX APP — Shared UI Logic
   Bottom Nav · Auth Drawer · Profile · Notifications
   Bookmarks · Floating Bubble · Section Animations
   ============================================================ */

(function () {
    'use strict';

    /* ── STORAGE HELPERS ─────────────────────────────────── */
    const Store = {
        get: (k, fallback = null) => {
            try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fallback; }
            catch { return fallback; }
        },
        set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
        remove: (k) => { try { localStorage.removeItem(k); } catch {} }
    };

    /* ── STATE ───────────────────────────────────────────── */
    const state = {
        user: Store.get('onyx_user', null),          // { name, email, avatar }
        bookmarks: Store.get('onyx_bookmarks', []),  // [{ title, img, href }]
        notifications: Store.get('onyx_notifs', getDefaultNotifs()),
        theme: Store.get('onyx_theme', 'dark'),
        drawerOpen: false,
        notifOpen: false,
        profileOpen: false,
        authOpen: false,
    };

    function getDefaultNotifs() {
        return [
            { id: 1, icon: 'fa-newspaper', title: 'New blog post published', body: 'Check out the latest tech article on Onyx.', time: 'Just now', unread: true },
            { id: 2, icon: 'fa-robot', title: 'Syncro AI is ready', body: 'Your intelligent assistant is online and waiting.', time: '2 min ago', unread: true },
            { id: 3, icon: 'fa-star', title: 'Welcome to Onyx!', body: 'Explore templates, blog posts, and more.', time: '1 hr ago', unread: false },
        ];
    }

    /* ── TOAST ───────────────────────────────────────────── */
    let toastTimer;
    function showToast(msg, icon = 'fa-check-circle') {
        let t = document.getElementById('onyxToast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'onyxToast';
            t.className = 'onyx-toast';
            document.body.appendChild(t);
        }
        t.innerHTML = `<i class="fas ${icon}"></i> ${msg}`;
        t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
    }

    /* ── BUILD BOTTOM NAV ────────────────────────────────── */
    function buildBottomNav() {
        const nav = document.createElement('nav');
        nav.className = 'onyx-bottom-nav';
        nav.id = 'onyxBottomNav';

        const isIndex = !document.body.classList.contains('syncro-page');
        const isSyncro = document.body.classList.contains('syncro-page');

        const unreadCount = state.notifications.filter(n => n.unread).length;

        nav.innerHTML = `
            <a class="onyx-nav-item ${isIndex ? 'active' : ''}" href="${isSyncro ? 'index.html' : '#home'}" id="navHome">
                <i class="fas fa-home"></i>
                <span>Home</span>
            </a>
            <a class="onyx-nav-item" href="${isSyncro ? 'index.html#blog' : '#blog'}" id="navTech">
                <i class="fas fa-newspaper"></i>
                <span>Tech</span>
            </a>
            <a class="onyx-nav-item ${isSyncro ? 'active' : ''}" href="${isSyncro ? '#' : 'syncro-chat.html'}" id="navSyncro">
                <i class="fas fa-robot"></i>
                <span>Syncro</span>
            </a>
            <button class="onyx-nav-item" id="navNotif">
                <i class="fas fa-bell"></i>
                ${unreadCount > 0 ? `<span class="onyx-nav-badge">${unreadCount}</span>` : ''}
                <span>Alerts</span>
            </button>
            <button class="onyx-nav-item" id="navMenu">
                <i class="fas fa-bars"></i>
                <span>Menu</span>
            </button>
        `;

        document.body.appendChild(nav);

        // Active link on scroll (index page only)
        if (isIndex) {
            window.addEventListener('scroll', () => {
                const sections = ['home', 'blog', 'about', 'contact'];
                let current = 'home';
                sections.forEach(id => {
                    const el = document.getElementById(id);
                    if (el && window.pageYOffset >= el.offsetTop - 120) current = id;
                });
                document.querySelectorAll('.onyx-nav-item').forEach(item => item.classList.remove('active'));
                if (current === 'home') document.getElementById('navHome')?.classList.add('active');
                if (current === 'blog') document.getElementById('navTech')?.classList.add('active');
            }, { passive: true });
        }

        document.getElementById('navNotif')?.addEventListener('click', openNotifPanel);
        document.getElementById('navMenu')?.addEventListener('click', openDrawer);
    }

    /* ── BUILD DRAWER ────────────────────────────────────── */
    function buildDrawer() {
        const overlay = document.createElement('div');
        overlay.className = 'onyx-drawer-overlay';
        overlay.id = 'drawerOverlay';
        overlay.addEventListener('click', closeDrawer);

        const drawer = document.createElement('div');
        drawer.className = 'onyx-drawer';
        drawer.id = 'onyxDrawer';
        drawer.innerHTML = buildDrawerHTML();

        document.body.appendChild(overlay);
        document.body.appendChild(drawer);

        bindDrawerEvents();
    }

    function buildDrawerHTML() {
        const u = state.user;
        const isDark = state.theme === 'dark';

        return `
        <div class="drawer-topbar">
            <div class="drawer-brand">
                <img src="https://i.ibb.co/jkd25QLn/Picsart-26-04-23-10-12-58-459.png" alt="Onyx">
                <span>Onyx</span>
            </div>
            <button class="drawer-close" id="drawerClose"><i class="fas fa-times"></i></button>
        </div>

        <div class="drawer-user" id="drawerUserSection">
            ${u ? `
            <div class="drawer-user-avatar" id="drawerAvatar">
                ${u.avatar ? `<img src="${u.avatar}" alt="${u.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : u.name.charAt(0).toUpperCase()}
            </div>
            <div class="drawer-user-name">${u.name}</div>
            <div class="drawer-user-email">${u.email}</div>
            ` : `
            <div class="drawer-user-avatar" id="drawerAvatar" style="font-size:1.8rem;">👤</div>
            <div class="drawer-user-name">Guest</div>
            <div class="drawer-user-email" style="color:#555;">Sign in to unlock all features</div>
            `}
        </div>

        <div class="drawer-menu">
            ${u ? `
            <button class="drawer-item" id="drawerProfile">
                <i class="fas fa-user-circle"></i> Edit Profile
            </button>
            <button class="drawer-item" id="drawerBookmarks">
                <i class="fas fa-bookmark"></i> Saved Posts
                ${state.bookmarks.length > 0 ? `<span style="margin-left:auto;font-size:0.75rem;color:#ffd700;">${state.bookmarks.length}</span>` : ''}
            </button>
            ` : `
            <button class="drawer-item" id="drawerSignIn">
                <i class="fas fa-sign-in-alt"></i> Sign In / Register
            </button>
            `}

            <div class="drawer-separator"></div>

            <a class="drawer-item" href="${document.body.classList.contains('syncro-page') ? 'index.html' : '#home'}">
                <i class="fas fa-home"></i> Home
            </a>
            <a class="drawer-item" href="${document.body.classList.contains('syncro-page') ? 'index.html#blog' : '#blog'}">
                <i class="fas fa-newspaper"></i> Tech Blog
            </a>
            <a class="drawer-item" href="${document.body.classList.contains('syncro-page') ? 'index.html#about' : '#about'}">
                <i class="fas fa-user"></i> About
            </a>
            <a class="drawer-item" href="${document.body.classList.contains('syncro-page') ? 'index.html#contact' : '#contact'}">
                <i class="fas fa-envelope"></i> Contact
            </a>
            <a class="drawer-item" href="${document.body.classList.contains('syncro-page') ? '#' : 'syncro-chat.html'}">
                <i class="fas fa-robot"></i> Syncro AI
            </a>

            <div class="drawer-separator"></div>

            <div class="drawer-theme-row">
                <span><i class="fas fa-moon"></i> Dark Mode</span>
                <div class="toggle-switch ${isDark ? 'on' : ''}" id="drawerThemeToggle">
                    <div class="toggle-knob"></div>
                </div>
            </div>

            <div class="drawer-separator"></div>

            ${u ? `
            <button class="drawer-item danger" id="drawerLogout">
                <i class="fas fa-sign-out-alt"></i> Log Out
            </button>
            ` : ''}

            <a class="drawer-item" href="mailto:rjsyncro@gmail.com">
                <i class="fas fa-envelope-open-text"></i> rjsyncro@gmail.com
            </a>
            <a class="drawer-item" href="https://instagram.com/o_rj_0" target="_blank">
                <i class="fab fa-instagram"></i> @o_rj_0
            </a>
        </div>`;
    }

    function bindDrawerEvents() {
        document.getElementById('drawerClose')?.addEventListener('click', closeDrawer);

        document.getElementById('drawerProfile')?.addEventListener('click', () => {
            closeDrawer();
            setTimeout(openProfile, 200);
        });

        document.getElementById('drawerBookmarks')?.addEventListener('click', () => {
            closeDrawer();
            setTimeout(openProfile, 200); // profile page shows saved posts
        });

        document.getElementById('drawerSignIn')?.addEventListener('click', () => {
            closeDrawer();
            setTimeout(openAuth, 200);
        });

        document.getElementById('drawerLogout')?.addEventListener('click', () => {
            closeDrawer();
            setTimeout(() => {
                if (confirm('Log out of Onyx?')) {
                    Store.remove('onyx_user');
                    state.user = null;
                    showToast('Logged out successfully', 'fa-sign-out-alt');
                    setTimeout(() => location.reload(), 800);
                }
            }, 300);
        });

        document.getElementById('drawerThemeToggle')?.addEventListener('click', function () {
            const isDark = state.theme === 'dark';
            state.theme = isDark ? 'light' : 'dark';
            Store.set('onyx_theme', state.theme);
            this.classList.toggle('on', !isDark);
            document.body.classList.toggle('light-theme', !isDark);
            // sync with existing theme icon if present
            const icon = document.querySelector('#themeToggle i');
            if (icon) icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
            showToast(isDark ? 'Light mode on' : 'Dark mode on', isDark ? 'fa-sun' : 'fa-moon');
        });
    }

    function openDrawer() {
        state.drawerOpen = true;
        document.getElementById('onyxDrawer').classList.add('open');
        document.getElementById('drawerOverlay').classList.add('open');
    }

    function closeDrawer() {
        state.drawerOpen = false;
        document.getElementById('onyxDrawer')?.classList.remove('open');
        document.getElementById('drawerOverlay')?.classList.remove('open');
    }

    /* ── BUILD AUTH MODAL ────────────────────────────────── */
    function buildAuth() {
        const modal = document.createElement('div');
        modal.className = 'onyx-auth-modal';
        modal.id = 'onyxAuthModal';
        modal.innerHTML = `
        <div class="auth-backdrop" id="authBackdrop"></div>
        <div class="auth-sheet">
            <div class="auth-handle"></div>
            <img class="auth-logo" src="https://i.ibb.co/jkd25QLn/Picsart-26-04-23-10-12-58-459.png" alt="Onyx">
            <h2 class="auth-title">Welcome to Onyx</h2>
            <p class="auth-subtitle">Sign in to save posts, personalise your experience and more.</p>

            <button class="auth-btn google" id="authGoogle">
                <i class="fab fa-google"></i> Continue with Google
            </button>
            <button class="auth-btn apple" id="authApple">
                <i class="fab fa-apple"></i> Continue with Apple
            </button>

            <div class="auth-divider">or</div>

            <button class="auth-btn email" id="authEmailBtn">
                <i class="fas fa-envelope"></i> Continue with Email
            </button>

            <div class="auth-email-form" id="authEmailForm">
                <input class="auth-input" type="text" id="authName" placeholder="Your name">
                <input class="auth-input" type="email" id="authEmail" placeholder="Email address">
                <button class="auth-submit" id="authSubmit">Sign In / Register</button>
            </div>
        </div>`;
        document.body.appendChild(modal);

        document.getElementById('authBackdrop').addEventListener('click', closeAuth);

        document.getElementById('authGoogle').addEventListener('click', () => simulateOAuth('Google'));
        document.getElementById('authApple').addEventListener('click', () => simulateOAuth('Apple'));

        document.getElementById('authEmailBtn').addEventListener('click', () => {
            const form = document.getElementById('authEmailForm');
            form.classList.toggle('show');
        });

        document.getElementById('authSubmit').addEventListener('click', () => {
            const name = document.getElementById('authName').value.trim();
            const email = document.getElementById('authEmail').value.trim();
            if (!name || !email) { showToast('Please fill in all fields', 'fa-exclamation-circle'); return; }
            if (!/\S+@\S+\.\S+/.test(email)) { showToast('Please enter a valid email', 'fa-exclamation-circle'); return; }
            signIn({ name, email, avatar: null, provider: 'email' });
        });
    }

    function simulateOAuth(provider) {
        closeAuth();
        showToast(`Connecting to ${provider}…`, 'fa-spinner');
        setTimeout(() => {
            const mockUser = {
                name: provider === 'Google' ? 'Raj (RJ)' : 'Onyx User',
                email: provider === 'Google' ? 'rjsyncro@gmail.com' : 'user@icloud.com',
                avatar: null,
                provider
            };
            signIn(mockUser);
        }, 1200);
    }

    function signIn(user) {
        state.user = user;
        Store.set('onyx_user', user);
        closeAuth();
        showToast(`Welcome, ${user.name}! 🎉`, 'fa-user-check');
        setTimeout(() => {
            // Refresh drawer to show profile options
            const drawer = document.getElementById('onyxDrawer');
            if (drawer) drawer.innerHTML = buildDrawerHTML();
            bindDrawerEvents();
        }, 500);
    }

    function openAuth() {
        state.authOpen = true;
        document.getElementById('onyxAuthModal').classList.add('open');
    }

    function closeAuth() {
        state.authOpen = false;
        document.getElementById('onyxAuthModal')?.classList.remove('open');
    }

    /* ── BUILD PROFILE PAGE ──────────────────────────────── */
    function buildProfile() {
        const page = document.createElement('div');
        page.className = 'profile-page';
        page.id = 'profilePage';
        page.innerHTML = buildProfileHTML();
        document.body.appendChild(page);
        bindProfileEvents();
    }

    function buildProfileHTML() {
        const u = state.user || { name: 'Guest', email: '', avatar: null };
        const avatarContent = u.avatar
            ? `<img src="${u.avatar}" alt="${u.name}" style="width:100%;height:100%;object-fit:cover;">`
            : u.name.charAt(0).toUpperCase();

        const savedHTML = state.bookmarks.length > 0
            ? state.bookmarks.map((b, i) => `
                <div class="saved-post-item" style="animation-delay:${i * 0.07}s" onclick="window.location='${b.href}'">
                    <img src="${b.img || 'https://i.ibb.co/jkd25QLn/Picsart-26-04-23-10-12-58-459.png'}" alt="${b.title}">
                    <div class="saved-post-info">
                        <h4>${b.title}</h4>
                        <span>Saved post</span>
                    </div>
                    <i class="fas fa-chevron-right" style="color:#444;margin-left:auto;font-size:0.8rem;"></i>
                </div>`).join('')
            : `<div class="saved-empty"><i class="fas fa-bookmark"></i>No saved posts yet.<br>Tap the bookmark icon on any article.</div>`;

        return `
        <div class="profile-header">
            <button class="profile-back-btn" id="profileBack"><i class="fas fa-arrow-left"></i></button>
            <h2>My Profile</h2>
        </div>
        <div class="profile-body">
            <div class="profile-avatar-section">
                <div class="profile-avatar-wrap">
                    <div class="profile-avatar-img" id="profileAvatarPreview">${avatarContent}</div>
                    <label class="profile-avatar-edit" title="Change photo">
                        <i class="fas fa-camera"></i>
                        <input type="file" id="profileAvatarInput" accept="image/*">
                    </label>
                </div>
                <div class="profile-username-display" id="profileNameDisplay">${u.name}</div>
                <div class="profile-email-display">${u.email || 'Not signed in'}</div>
            </div>

            <div class="profile-form-section">
                <div class="profile-field">
                    <label>Display Name</label>
                    <input class="profile-input" id="profileNameInput" type="text" value="${u.name}" placeholder="Your name">
                </div>
                <div class="profile-field">
                    <label>Bio</label>
                    <input class="profile-input" id="profileBioInput" type="text" value="${u.bio || ''}" placeholder="Short bio...">
                </div>
                <div class="profile-field">
                    <label>Email</label>
                    <input class="profile-input" id="profileEmailInput" type="email" value="${u.email || ''}" placeholder="Email address" ${u.provider ? 'readonly style="opacity:0.5"' : ''}>
                </div>
                <button class="profile-save-btn" id="profileSave">Save Changes</button>
                <button class="profile-logout-btn" id="profileLogout">
                    <i class="fas fa-sign-out-alt"></i> Log Out
                </button>
            </div>

            <div class="profile-saved-section">
                <h3><i class="fas fa-bookmark"></i> Saved Posts (${state.bookmarks.length})</h3>
                <div id="savedPostsList">${savedHTML}</div>
            </div>
        </div>`;
    }

    function bindProfileEvents() {
        document.getElementById('profileBack')?.addEventListener('click', closeProfile);

        // Avatar upload
        document.getElementById('profileAvatarInput')?.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const src = e.target.result;
                const preview = document.getElementById('profileAvatarPreview');
                if (preview) preview.innerHTML = `<img src="${src}" alt="avatar" style="width:100%;height:100%;object-fit:cover;">`;
                if (state.user) { state.user.avatar = src; Store.set('onyx_user', state.user); }
                showToast('Profile photo updated!', 'fa-camera');
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('profileSave')?.addEventListener('click', () => {
            const name = document.getElementById('profileNameInput').value.trim();
            const bio = document.getElementById('profileBioInput').value.trim();
            const email = document.getElementById('profileEmailInput').value.trim();
            if (!name) { showToast('Name cannot be empty', 'fa-exclamation-circle'); return; }
            if (state.user) {
                state.user.name = name;
                state.user.bio = bio;
                if (!state.user.provider) state.user.email = email;
                Store.set('onyx_user', state.user);
            }
            document.getElementById('profileNameDisplay').textContent = name;
            showToast('Profile saved! ✨', 'fa-check-circle');
        });

        document.getElementById('profileLogout')?.addEventListener('click', () => {
            if (confirm('Log out of Onyx?')) {
                Store.remove('onyx_user');
                state.user = null;
                closeProfile();
                showToast('Logged out', 'fa-sign-out-alt');
                setTimeout(() => location.reload(), 800);
            }
        });
    }

    function openProfile() {
        if (!state.user) { openAuth(); return; }
        state.profileOpen = true;
        // Rebuild in case bookmarks changed
        const page = document.getElementById('profilePage');
        if (page) { page.innerHTML = buildProfileHTML(); bindProfileEvents(); }
        document.getElementById('profilePage')?.classList.add('open');
    }

    function closeProfile() {
        state.profileOpen = false;
        document.getElementById('profilePage')?.classList.remove('open');
    }

    /* ── BUILD NOTIFICATIONS PANEL ───────────────────────── */
    function buildNotifPanel() {
        const overlay = document.createElement('div');
        overlay.className = 'onyx-drawer-overlay';
        overlay.id = 'notifOverlay';
        overlay.addEventListener('click', closeNotifPanel);

        const panel = document.createElement('div');
        panel.className = 'onyx-notif-panel';
        panel.id = 'notifPanel';
        panel.innerHTML = buildNotifHTML();

        document.body.appendChild(overlay);
        document.body.appendChild(panel);

        bindNotifEvents();
    }

    function buildNotifHTML() {
        const items = state.notifications.map(n => `
            <div class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
                <div class="notif-icon"><i class="fas ${n.icon}"></i></div>
                <div class="notif-content">
                    <h4>${n.title}</h4>
                    <p>${n.body}</p>
                    <div class="notif-time">${n.time}</div>
                </div>
            </div>`).join('');

        return `
        <div class="notif-header">
            <h3><i class="fas fa-bell"></i> Notifications</h3>
            <button class="notif-clear" id="notifClearAll">Clear all</button>
        </div>
        <div class="notif-list" id="notifList">
            ${items || '<div style="text-align:center;color:#444;padding:30px;font-size:0.9rem;">No notifications</div>'}
        </div>`;
    }

    function bindNotifEvents() {
        document.getElementById('notifClearAll')?.addEventListener('click', () => {
            state.notifications = [];
            Store.set('onyx_notifs', []);
            const list = document.getElementById('notifList');
            if (list) list.innerHTML = '<div style="text-align:center;color:#444;padding:30px;font-size:0.9rem;">No notifications</div>';
            // Clear badge
            const badge = document.querySelector('#navNotif .onyx-nav-badge');
            if (badge) badge.remove();
            showToast('Notifications cleared', 'fa-check');
        });

        document.querySelectorAll('.notif-item').forEach(item => {
            item.addEventListener('click', function () {
                const id = +this.dataset.id;
                const notif = state.notifications.find(n => n.id === id);
                if (notif) { notif.unread = false; Store.set('onyx_notifs', state.notifications); }
                this.classList.remove('unread');
                updateNotifBadge();
            });
        });
    }

    function updateNotifBadge() {
        const count = state.notifications.filter(n => n.unread).length;
        const badge = document.querySelector('#navNotif .onyx-nav-badge');
        if (count > 0) {
            if (badge) badge.textContent = count;
        } else {
            badge?.remove();
        }
    }

    function openNotifPanel() {
        state.notifOpen = true;
        document.getElementById('notifPanel').classList.add('open');
        document.getElementById('notifOverlay').classList.add('open');
    }

    function closeNotifPanel() {
        state.notifOpen = false;
        document.getElementById('notifPanel')?.classList.remove('open');
        document.getElementById('notifOverlay')?.classList.remove('open');
    }

    /* ── FLOATING SYNCRO BUBBLE ──────────────────────────── */
    function buildFloatBubble() {
        // Don't show on Syncro page
        if (document.body.classList.contains('syncro-page')) return;
        const btn = document.createElement('a');
        btn.className = 'syncro-float-btn';
        btn.href = 'syncro-chat.html';
        btn.title = 'Chat with Syncro AI';
        btn.innerHTML = `
            <img src="https://i.ibb.co/JjZPmBpV/Picsart-26-04-22-09-03-55-835.jpg" alt="Syncro AI">
            <span class="syncro-float-tooltip">Chat with Syncro</span>`;
        document.body.appendChild(btn);
    }

    /* ── BOOKMARK BUTTONS ON BLOG CARDS ──────────────────── */
    function initBookmarks() {
        const cards = document.querySelectorAll('.blog-card');
        cards.forEach(card => {
            // Make sure card has relative positioning (CSS handles this too)
            const btn = document.createElement('button');
            btn.className = 'bookmark-btn';
            btn.title = 'Save post';
            btn.innerHTML = '<i class="fas fa-bookmark"></i>';

            const title = card.querySelector('h3')?.textContent || 'Untitled';
            const img = card.querySelector('img')?.src || '';
            const link = card.querySelector('a')?.href || '#';

            const isSaved = state.bookmarks.some(b => b.title === title);
            if (isSaved) btn.classList.add('saved');

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleBookmark(btn, { title, img, href: link });
            });

            card.appendChild(btn);
        });
    }

    function toggleBookmark(btn, post) {
        const idx = state.bookmarks.findIndex(b => b.title === post.title);
        if (idx > -1) {
            state.bookmarks.splice(idx, 1);
            btn.classList.remove('saved');
            showToast('Removed from saved', 'fa-bookmark');
        } else {
            state.bookmarks.push(post);
            btn.classList.add('saved');
            showToast('Post saved! 🔖', 'fa-bookmark');
        }
        Store.set('onyx_bookmarks', state.bookmarks);
    }

    /* ── SECTION ANIMATIONS ──────────────────────────────── */
    function initSectionAnimations() {
        const config = [
            // Each entry: [selector, animation-class, threshold]
            ['.video-banner, .hero',            'section-anim-hero',    0.05],
            ['.blog-card',                       'section-anim-blog',    0.12],
            ['.about-content, .about-text, .about-image', 'section-anim-about', 0.12],
            ['.contact-content, .contact-form, .contact-info', 'section-anim-contact', 0.1],
            ['.stat-item',                       'section-anim-stat',    0.2],
            ['.footer',                          'section-anim-footer',  0.05],
        ];

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Find which class to apply
                    config.forEach(([sel, cls]) => {
                        if (entry.target.matches(sel)) {
                            entry.target.classList.add(cls);
                        }
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        config.forEach(([sel]) => {
            document.querySelectorAll(sel).forEach(el => {
                // Set invisible before animation triggers
                el.style.opacity = '0';
                observer.observe(el);
            });
        });
    }

    /* ── THEME PERSISTENCE ───────────────────────────────── */
    function applyTheme() {
        if (state.theme === 'light') {
            document.body.classList.add('light-theme');
            const icon = document.querySelector('#themeToggle i');
            if (icon) icon.className = 'fas fa-moon';
        }
    }

    /* ── KEYBOARD / SWIPE CLOSE ──────────────────────────── */
    function initGestures() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeDrawer();
                closeNotifPanel();
                closeAuth();
                closeProfile();
            }
        });

        // Swipe right to close drawers / profile
        let touchStartX = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (dx > 70) {
                if (state.drawerOpen) closeDrawer();
                if (state.notifOpen) closeNotifPanel();
                if (state.profileOpen) closeProfile();
            }
        }, { passive: true });
    }

    /* ── INIT ────────────────────────────────────────────── */
    function init() {
        applyTheme();
        buildBottomNav();
        buildDrawer();
        buildAuth();
        buildProfile();
        buildNotifPanel();
        buildFloatBubble();
        initBookmarks();
        initSectionAnimations();
        initGestures();

        // Show welcome notification for new users after 3s
        if (!Store.get('onyx_welcomed')) {
            setTimeout(() => {
                showToast('Welcome to Onyx! 👋', 'fa-star');
                Store.set('onyx_welcomed', true);
            }, 3000);
        }

        console.log('🔥 Onyx App UI loaded');
    }

    /* Run after DOM + existing scripts are ready */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Small delay to not fight with existing scripts
        setTimeout(init, 100);
    }

})();
