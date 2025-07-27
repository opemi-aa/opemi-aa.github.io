document.addEventListener('DOMContentLoaded', function() {
    // Function to check if an element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Function to handle scroll animations
    function handleScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('animated');
            }
        });

        const toolCards = document.querySelectorAll('.tools-container .tool-card');
        toolCards.forEach((card, index) => {
            if (isInViewport(card)) {
                card.style.setProperty('--animation-order', index);
                card.classList.add('animated');
            }
        });

        const toolCategories = document.querySelectorAll('.tool-category');
        toolCategories.forEach(category => {
            if (isInViewport(category)) {
                category.classList.add('animated');
            }
        });

        const searchContainer = document.querySelector('.search-container');
        if (searchContainer && isInViewport(searchContainer)) {
            searchContainer.classList.add('animated');
        }
    }

    // Initial check on load
    handleScrollAnimations();

    // Listen for scroll events
    window.addEventListener('scroll', handleScrollAnimations);

    // Background animations (Cyber Grid and Particles)
    const body = document.body;
    const cyberGrid = document.createElement('div');
    cyberGrid.classList.add('cyber-grid');
    body.prepend(cyberGrid);

    const particlesContainer = document.createElement('div');
    particlesContainer.classList.add('particles-container');
    body.prepend(particlesContainer);

    const numParticles = 50; // Number of particles
    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 5}s`; // Random delay for varied animation
        particlesContainer.appendChild(particle);
    }

    // Cursor Effect
    const cursorDot = document.createElement('div');
    cursorDot.classList.add('cursor-dot');
    document.body.appendChild(cursorDot);

    document.addEventListener('mousemove', function(e) {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';

        // Create trail dots
        const trailDot = document.createElement('div');
        trailDot.classList.add('cursor-trail-dot');
        document.body.appendChild(trailDot);

        trailDot.style.left = e.clientX + 'px';
        trailDot.style.top = e.clientY + 'px';

        // Remove trail dot after a delay
        setTimeout(() => {
            trailDot.remove();
        }, 500); // Adjust delay for desired trail length
    });

    // Navigation button handlers
    const gameButton = document.getElementById('gameButton');
    if (gameButton) {
        gameButton.addEventListener('click', () => {
            window.location.href = '/games/';
        });
    }

    const gameMenuButton = document.getElementById('gameMenuButton');
    if (gameMenuButton) {
        gameMenuButton.addEventListener('click', () => {
            window.location.href = '/games/';
        });
    }

    const homeButton = document.getElementById('homeButton');
    if (homeButton) {
        homeButton.addEventListener('click', () => {
            window.location.href = '/';
        });
    }

    const hackButton = document.getElementById('hackButton');
    if (hackButton) {
        hackButton.addEventListener('click', () => {
            window.location.href = '/hack/';
        });
    }
});