const dotsContainer = document.getElementById('dots-container');
const numberOfDots = 50; // Adjust as needed

function createDot() {
    const dot = document.createElement('div');
    dot.classList.add('dot');

    // Random size
    const size = Math.random() * 10 + 5; // Dots between 5px and 15px
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;

    // Random initial position (within the viewport)
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + Math.random() * 100; // Start slightly below viewport
    dot.style.left = `${startX}px`;
    dot.style.top = `${startY}px`;

    // Random animation duration and delay
    const duration = Math.random() * 10 + 10; // Between 10s and 20s
    const delay = Math.random() * 10; // Between 0s and 10s
    dot.style.animationDuration = `${duration}s`;
    dot.style.animationDelay = `${delay}s`;

    // Randomize background color slightly for variation
    const hue = Math.random() * 360;
    dot.style.backgroundColor = `hsla(${hue}, 70%, 80%, ${0.2 + Math.random() * 0.3})`;


    dotsContainer.appendChild(dot);

    // Remove dot after animation completes to prevent accumulation
    dot.addEventListener('animationend', () => {
        dot.remove();
        // Recreate a new dot to maintain the continuous animation
        createDot();
    });
}

// Create initial dots
for (let i = 0; i < numberOfDots; i++) {
    createDot();
}

// Handle window resize to adjust dot positions if necessary (optional, but good practice)
window.addEventListener('resize', () => {
    // For simplicity, we'll just let existing dots finish and new ones spawn correctly.
    // A more complex solution might reposition active dots.
});

// Scroll to top button functionality
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
};

// When the user clicks on the button, scroll to the top of the document
scrollToTopBtn.addEventListener("click", function() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
});