// =============================================================================
// STATE TRACKING
// =============================================================================

let hoverCount = 0;
let hintShown = false;

// =============================================================================
// DOM ELEMENTS
// =============================================================================

const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const hint = document.getElementById('hint');
const response = document.getElementById('response');
const buttonContainer = document.getElementById('buttonContainer');
const bgOverlay = document.getElementById('bgOverlay');

// =============================================================================
// BUTTON MOVEMENT
// Generates random position within safe bounds (40-75px from center)
// Movement is gentle and limited - not chaotic
// =============================================================================

function getRandomPosition() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 35; // Between 40-75px

    return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
    };
}

// =============================================================================
// "NO" BUTTON INTERACTION
// Moves away gently on hover
// Shows hint text only once after first hover
// =============================================================================

noBtn.addEventListener('mouseenter', () => {
    const pos = getRandomPosition();
    noBtn.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

    // Show hint only once
    if (!hintShown) {
        hoverCount++;
        if (hoverCount === 1) {
            hint.textContent = 'Okay okay 😅';
            hint.classList.add('visible');
            hintShown = true;
        }
    }
});

// Reset "No" button position after mouse leaves
// Creates softer inte
