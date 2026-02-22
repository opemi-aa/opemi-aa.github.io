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

    // Mobile nav toggle
    const snavToggle = document.getElementById('snavToggle');
    const snavLinks  = document.getElementById('snavLinks');
    if (snavToggle && snavLinks) {
        snavToggle.addEventListener('click', () => {
            snavLinks.classList.toggle('open');
        });
        // Close nav when a link is tapped
        snavLinks.querySelectorAll('.snav-link').forEach(link => {
            link.addEventListener('click', () => snavLinks.classList.remove('open'));
        });
        // Close nav on outside click
        document.addEventListener('click', (e) => {
            if (!snavToggle.contains(e.target) && !snavLinks.contains(e.target)) {
                snavLinks.classList.remove('open');
            }
        });
    }
});