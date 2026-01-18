let hintShown = false;

const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const hint = document.getElementById("hint");
const response = document.getElementById("response");
const buttonContainer = document.getElementById("buttonContainer");
const heartsContainer = document.getElementById("heartsContainer");
const bgOverlay = document.getElementById("bgOverlay");

// Gentle random movement
function randomOffset() {
  const angle = Math.random() * Math.PI * 2;
  const distance = 40 + Math.random() * 40;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
}

// No button behavior
noBtn.addEventListener("mouseenter", () => {
  const pos = randomOffset();
  noBtn.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

  if (!hintShown) {
    hint.textContent = "Okay okay 😅";
    hint.classList.add("visible");
    hintShown = true;
  }
});

noBtn.addEventListener("mouseleave", () => {
  setTimeout(() => {
    noBtn.style.transform = "translate(0, 0)";
  }, 800);
});

// Yes button behavior
yesBtn.addEventListener("click", () => {
  buttonContainer.style.display = "none";
  hint.classList.remove("visible");

  response.textContent = "Okay. That made me smile.";
  response.classList.add("visible");

  bgOverlay.classList.add("active");
  startHearts();
});

// Hearts logic
function startHearts() {
  setInterval(() => {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.bottom = "-20px";
    heartsContainer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 6000);
  }, 600);
}
