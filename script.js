const container = document.getElementById('particle-container');
const gridSize = 30; // Let's make a 30x30 grid

// Set CSS variable for grid size
container.style.setProperty('--grid-size', gridSize);

// We use a DocumentFragment for performance when adding many elements
const fragment = document.createDocumentFragment();

// Create the dots
for (let i = 0; i < gridSize * gridSize; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    fragment.appendChild(dot);
}

container.appendChild(fragment);

// Now set the grid layout using the variable
container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
container.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

// Add a little note on the page
const info = document.createElement('div');
info.textContent = 'Move mouse to interact. Click to explode.';
info.style.position = 'absolute';
info.style.bottom = '20px';
info.style.color = '#444';
document.body.appendChild(info);

container.addEventListener('click', () => {
    // This is where the magic happens!
    anime({
        targets: '.dot',
        // 1. EXPLOSION
        translateX: () => anime.random(-300, 300), // Move to a random X position
        translateY: () => anime.random(-300, 300), // Move to a random Y position
        scale: () => anime.random(0.5, 1.5),      // Scale to a random size
        opacity: [1, 0.5],                        // Fade out a bit
        delay: anime.stagger(5),                  // Stagger the start of each animation
        duration: 1000,
        easing: 'easeOutExpo',

        // 2. RESET
        // The 'complete' callback runs after the first animation finishes
        complete: () => {
            anime({
                targets: '.dot',
                translateX: 0, // Return to original X
                translateY: 0, // Return to original Y
                scale: 1,      // Return to original size
                opacity: 1,    // Fade back in
                duration: 1200,
                easing: 'easeInOutExpo',
                delay: anime.stagger(5),
            });
        }
    });
});
// Keep track of the currently running animation
let currentAnimation = null;

// Keep track of the currently running hover animation
let hoverAnimation = null;

document.addEventListener('mousemove', e => {
    // If a hover animation is running, cancel it immediately.
    // .pause() is used because there's no .cancel(), but it has the same effect here.
    if (hoverAnimation) hoverAnimation.pause();

    // Get mouse coordinates
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Start a new, very responsive animation
    hoverAnimation = anime({
        targets: '.dot',
        
        // Use functions to calculate the push for each dot individually
        translateX: function(el) {
            const elRect = el.getBoundingClientRect();
            const elCenterX = elRect.left + elRect.width / 2;
            const deltaX = elCenterX - mouseX;
            // The push strength is stronger when the dot is closer
            // The 4000 is a "force" value you can play with
            const pushFactor = -4000 / deltaX;
            // Clamp the value to prevent dots from flying off to infinity
            return Math.min(Math.max(pushFactor, -50), 50); 
        },
        translateY: function(el) {
            const elRect = el.getBoundingClientRect();
            const elCenterY = elRect.top + elRect.height / 2;
            const deltaY = elCenterY - mouseY;
            const pushFactor = -4000 / deltaY;
            return Math.min(Math.max(pushFactor, -50), 50);
        },
        scale: 1.2, // Make dots under the influence slightly bigger
        
        // === THIS IS THE KEY TO SMOOTHNESS ===
        duration: 150,      // A very short duration
        easing: 'easeOut',  // A simple easing
    });
});

// Add a mouseleave event to reset the grid when the mouse leaves the area
container.addEventListener('mouseleave', () => {
    if (hoverAnimation) hoverAnimation.pause();
    
    anime({
        targets: '.dot',
        translateX: 0,
        translateY: 0,
        scale: 1,
        duration: 1200,
        easing: 'easeInOutExpo'
    });
});