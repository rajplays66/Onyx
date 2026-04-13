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
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Form Submission
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // In a real application, you would send this data to a server
    // For now, we'll just show a success message
    alert(`Thank you ${name}! Your message has been sent successfully. I'll get back to you soon at ${email}.`);
    
    // Reset form
    contactForm.reset();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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
document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
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
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Active nav link based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 100) {
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

// ====== SMART VIDEO BANNER SWITCHING ======
// Properly loads desktop or mobile video based on screen size
// (Fixes broken HTML media attribute on <source> tags inside <video>)
function loadBannerVideo() {
    const video = document.querySelector('.banner-video');
    if (!video) return;

    // Determine which video to load
    const isDesktop = window.innerWidth >= 769;
    const videoSrc = isDesktop ? 'banner-desktop.mp4' : 'banner-mobile.mp4';

    // Only reload if the source has changed (avoids unnecessary reloads)
    const currentSrc = video.querySelector('source') ? video.querySelector('source').src : '';
    if (currentSrc.includes(videoSrc)) return;

    // Clear existing sources and set the correct one
    video.innerHTML = '';
    const source = document.createElement('source');
    source.src = videoSrc;
    source.type = 'video/mp4';
    video.appendChild(source);
    video.load();

    // Attempt autoplay
    video.play().catch(() => {
        // If autoplay is blocked, show a play button overlay
        const existing = document.querySelector('.video-play-btn');
        if (existing) return;

        const playButton = document.createElement('button');
        playButton.className = 'video-play-btn';
        playButton.innerHTML = '<i class="fas fa-play"></i> Play Video';
        playButton.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 215, 0, 0.85);
            color: black;
            border: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 1.2rem;
            font-weight: 700;
            cursor: pointer;
            z-index: 10;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        playButton.addEventListener('click', () => {
            video.play();
            playButton.remove();
        });
        video.parentElement.appendChild(playButton);
    });
}

// Load correct video on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('RJSyncro website loaded successfully!');

    // Set current year in footer
    const yearElement = document.querySelector('.footer-bottom p');
    if (yearElement) {
        yearElement.innerHTML = yearElement.innerHTML.replace('2024', new Date().getFullYear());
    }

    // Load the right banner video
    loadBannerVideo();

    // Create floating particles
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const size = Math.random() * 3 + 1;
            const duration = Math.random() * 15 + 10;
            const delay = Math.random() * 5;

            particle.style.left = left + '%';
            particle.style.top = top + '%';
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.opacity = Math.random() * 0.5 + 0.3;
            particle.style.animation = `floatParticle ${duration}s infinite linear ${delay}s`;

            particlesContainer.appendChild(particle);
        }
    }
});

// Also handle window resize (e.g. user rotates phone or resizes browser)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        loadBannerVideo();
    }, 300);
});
