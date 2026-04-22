// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');
const backToTop = document.getElementById('backToTop');
const contactForm = document.getElementById('contactForm');

// Mobile Menu Toggle
menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.innerHTML = navMenu.classList.contains('active')
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    if (document.body.classList.contains('light-theme')) {
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
});

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeIcon.className = 'fas fa-moon';
}

// Back to Top Button
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTop.style.display = 'flex';
    } else {
        backToTop.style.display = 'none';
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Form Submission
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    alert(`Thank you ${name}! Your message has been sent successfully. I'll get back to you soon at ${email}.`);
    contactForm.reset();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Newsletter form submission
document.querySelector('.newsletter-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const emailInput = this.querySelector('input[type="email"]');
    const email = emailInput.value;
    if (email) {
        alert(`Thank you! You've subscribed to our newsletter with email: ${email}`);
        emailInput.value = '';
    }
});

// Blog card hover effects
document.querySelectorAll('.blog-card').forEach(card => {
    card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-10px)'; });
    card.addEventListener('mouseleave', () => { card.style.transform = 'translateY(0)'; });
});

// Active nav link based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu a');
    let current = '';
    sections.forEach(section => {
        if (window.pageYOffset >= section.offsetTop - 100) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ====================================================
// FEATURE 1: LOADING SCREEN
// ====================================================
function initLoader() {
    const loader = document.getElementById('rj-loader');
    if (!loader) return;

    // Hide loader after 2 seconds
    setTimeout(() => {
        loader.classList.add('hide');
        // Remove from DOM after fade-out completes
        setTimeout(() => loader.remove(), 700);
    }, 2000);
}

// ====================================================
// FEATURE 2: SCROLL PROGRESS BAR
// ====================================================
function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = progress + '%';
    }, { passive: true });
}

// ====================================================
// FEATURE 3: SCROLL REVEAL ANIMATIONS
// ====================================================
function initScrollReveal() {
    // Assign reveal classes to target elements
    const revealTargets = [
        { selector: '.section-header',    cls: 'reveal' },
        { selector: '.blog-card',         cls: 'reveal reveal-child' },
        { selector: '.about-image',       cls: 'reveal reveal-left' },
        { selector: '.about-text',        cls: 'reveal reveal-right' },
        { selector: '.contact-info',      cls: 'reveal reveal-left' },
        { selector: '.contact-form',      cls: 'reveal reveal-right' },
        { selector: '.footer-logo',       cls: 'reveal' },
        { selector: '.footer-links',      cls: 'reveal reveal-child' },
        { selector: '.footer-newsletter', cls: 'reveal reveal-child' },
        { selector: '.stat-item',         cls: 'reveal reveal-child' },
        { selector: '.skill-tag',         cls: 'reveal reveal-child' },
    ];

    revealTargets.forEach(({ selector, cls }) => {
        document.querySelectorAll(selector).forEach(el => {
            cls.split(' ').forEach(c => el.classList.add(c));
        });
    });

    // IntersectionObserver triggers when element enters viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ====================================================
// SMART VIDEO BANNER SWITCHING
// ====================================================
function loadBannerVideo() {
    const video = document.querySelector('.banner-video');
    if (!video) return;

    const isDesktop = window.innerWidth >= 769;
    const videoSrc = isDesktop ? 'banner-desktop.mp4' : 'banner-mobile.mp4';

    // Only reload if source has changed
    const existingSource = video.querySelector('source');
    if (existingSource && existingSource.src.includes(videoSrc)) return;

    video.innerHTML = '';
    const source = document.createElement('source');
    source.src = videoSrc;
    source.type = 'video/mp4';
    video.appendChild(source);
    video.load();

    video.play().catch(() => {
        const existing = document.querySelector('.video-play-btn');
        if (existing) return;
        const playButton = document.createElement('button');
        playButton.className = 'video-play-btn';
        playButton.innerHTML = '<i class="fas fa-play"></i> Play Video';
        playButton.style.cssText = `
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 215, 0, 0.85); color: black;
            border: none; padding: 15px 30px; border-radius: 50px;
            font-size: 1.2rem; font-weight: 700; cursor: pointer;
            z-index: 10; display: flex; align-items: center; gap: 10px;
        `;
        playButton.addEventListener('click', () => { video.play(); playButton.remove(); });
        video.parentElement.appendChild(playButton);
    });
}

// ====================================================
// FLOATING PARTICLES
// ====================================================
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 3 + 1;
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 5;
        particle.style.left      = Math.random() * 100 + '%';
        particle.style.top       = Math.random() * 100 + '%';
        particle.style.width     = size + 'px';
        particle.style.height    = size + 'px';
        particle.style.opacity   = Math.random() * 0.5 + 0.3;
        particle.style.animation = `floatParticle ${duration}s infinite linear ${delay}s`;
        particlesContainer.appendChild(particle);
    }
}

// ====================================================
// INITIALISE EVERYTHING ON DOM READY
// ====================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('RJSyncro website loaded successfully!');

    // Update footer year automatically
    const yearElement = document.querySelector('.footer-bottom p');
    if (yearElement) {
        yearElement.innerHTML = yearElement.innerHTML.replace('2024', new Date().getFullYear());
    }

    initLoader();           // 🎬 Loading screen
    initScrollProgress();   // 📊 Scroll progress bar
    initScrollReveal();     // ✨ Scroll reveal animations
    loadBannerVideo();      // 🎥 Smart video switching
    initParticles();        // ✦  Floating particles
});

// Handle resize for video switching (e.g. phone rotation)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => loadBannerVideo(), 300);
});
