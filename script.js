/* =====================================================
   BACKGROUND PIXEL HEARTS (BOTTOM → TOP, ABSORBED)
   ===================================================== */

const bgCanvas = document.getElementById("bgCanvas");
const bgCtx = bgCanvas.getContext("2d");

function resizeBG() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeBG();
window.addEventListener("resize", resizeBG);

const pixelHeart = new Image();
pixelHeart.src = "shrut-heart.png";

const HEART_COUNT = 16;
const bgHearts = [];

/* Create heart (always off-screen safe) */
function createBgHeart(initial = false) {
  return {
    x: Math.random() * bgCanvas.width,
    y: initial
      ? Math.random() * bgCanvas.height
      : bgCanvas.height + Math.random() * 200,
    size: 42 + Math.random() * 26,
    speed: 0.22 + Math.random() * 0.22,
    opacity: 0.22 + Math.random() * 0.12,
    absorbing: false
  };
}

/* Init hearts */
function initBgHearts() {
  bgHearts.length = 0;
  for (let i = 0; i < HEART_COUNT; i++) {
    bgHearts.push(createBgHeart(true));
  }
}

/* Main heart center (DOM-based, accurate) */
function getMainHeartCenter() {
  const main = document.getElementById("heartCanvas");
  const rect = main.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}

/* Animate background hearts */
function animateBgHearts() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgCtx.imageSmoothingEnabled = false;

  const target = getMainHeartCenter();
  const absorbRadius = 120;

  for (let i = 0; i < bgHearts.length; i++) {
    const h = bgHearts[i];

    // Move upward
    h.y -= h.speed;

    // Distance to main heart
    const dx = h.x - target.x;
    const dy = h.y - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Start absorption
    if (dist < absorbRadius) {
      h.absorbing = true;
    }

    if (h.absorbing) {
      h.opacity -= 0.03;
      h.size *= 0.96;
    }

    bgCtx.globalAlpha = Math.max(h.opacity, 0);
    bgCtx.drawImage(pixelHeart, h.x, h.y, h.size, h.size);

    // Recycle ONLY after fully invisible or fully off-screen
    if (h.opacity <= 0 || h.y < -h.size - 80) {
      bgHearts[i] = createBgHeart(false);
    }
  }

  bgCtx.globalAlpha = 1;
  requestAnimationFrame(animateBgHearts);
}

pixelHeart.onload = () => {
  initBgHearts();
  animateBgHearts();
};

/* =====================================================
   MAIN HEART (UNCHANGED SELF-DRAWING HEART)
   ===================================================== */

const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");
const afterHeart = document.getElementById("afterHeart");

const rose = "#c97a7a";
ctx.strokeStyle = rose;
ctx.lineWidth = 2.2;
ctx.lineCap = "round";

function heartPoint(t) {
  return {
    x: 16 * Math.pow(Math.sin(t), 3),
    y:
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
  };
}

let step = 0;
const TOTAL = 520;

function drawMainHeart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  for (let i = 0; i < step; i++) {
    const p = heartPoint((i / TOTAL) * Math.PI * 2);
    const x = canvas.width / 2 + p.x * 8;
    const y = canvas.height / 2 - p.y * 8;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.shadowColor = rose;
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (step < TOTAL) {
    step++;
    requestAnimationFrame(drawMainHeart);
  } else {
    afterHeart.textContent = "I’m taking responsibility.";
  }
}

drawMainHeart();

/* =====================================================
   BUTTONS
   ===================================================== */

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const answer = document.getElementById("answer");
const buttons = document.getElementById("buttons");

yesBtn.addEventListener("click", () => {
  buttons.style.display = "none";
  answer.textContent = "Thank you for trusting me.";
});

noBtn.addEventListener("click", () => {
  buttons.style.display = "none";
  answer.textContent = "I understand. I’m still here.";
});
