/* =====================================================
   BACKGROUND PIXEL HEARTS
   - bottom → top
   - absorbed into main heart
   - no overlap ever
   ===================================================== */

const bgCanvas = document.getElementById("bgCanvas");
const bgCtx = bgCanvas.getContext("2d");

function resizeBG() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeBG();
window.addEventListener("resize", resizeBG);

/* Load pixel heart image */
const heartImg = new Image();
heartImg.src = "shrut-heart.png";

/* Configuration */
const HEART_COUNT = 14;
const MIN_DISTANCE = 70; // hearts never touch
const bgHearts = [];

/* Get main heart center in CANVAS coords */
function getMainHeartCenterCanvas() {
  const main = document.getElementById("heartCanvas");
  const rect = main.getBoundingClientRect();
  const canvasRect = bgCanvas.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2 - canvasRect.left,
    y: rect.top + rect.height / 2 - canvasRect.top
  };
}

/* Distance helper */
function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/* Create heart safely */
function createHeart(initial = false) {
  let heart;
  let safe = false;

  while (!safe) {
    heart = {
      x: Math.random() * bgCanvas.width,
      y: initial
        ? Math.random() * bgCanvas.height
        : bgCanvas.height + Math.random() * 200,
      size: 42 + Math.random() * 24,
      speed: 0.22 + Math.random() * 0.18,
      opacity: 0.25,
      absorbing: false
    };

    safe = bgHearts.every(h => dist(h, heart) > MIN_DISTANCE);
  }

  return heart;
}

/* Initialize hearts */
function initHearts() {
  bgHearts.length = 0;
  for (let i = 0; i < HEART_COUNT; i++) {
    bgHearts.push(createHeart(true));
  }
}

/* Animation loop */
function animateBG() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgCtx.imageSmoothingEnabled = false;

  const target = getMainHeartCenterCanvas();
  const absorbRadius = 120;

  for (let i = 0; i < bgHearts.length; i++) {
    const h = bgHearts[i];

    /* Movement */
    h.y -= h.speed;

    /* Absorption check */
    const d = dist(h, target);
    if (d < absorbRadius) {
      h.absorbing = true;
    }

    /* Absorption behavior */
    if (h.absorbing) {
      h.opacity -= 0.03;
      h.size *= 0.95;

      // Pull toward center slightly
      h.x += (target.x - h.x) * 0.05;
      h.y += (target.y - h.y) * 0.05;
    }

    /* Draw */
    bgCtx.globalAlpha = Math.max(h.opacity, 0);
    bgCtx.drawImage(heartImg, h.x, h.y, h.size, h.size);

    /* Recycle ONLY after invisible or fully off screen */
    if (h.opacity <= 0 || h.y < -h.size - 80) {
      bgHearts[i] = createHeart(false);
    }
  }

  bgCtx.globalAlpha = 1;
  requestAnimationFrame(animateBG);
}

/* Start */
heartImg.onload = () => {
  initHearts();
  animateBG();
};

/* =====================================================
   MAIN HEART (UNCHANGED)
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
