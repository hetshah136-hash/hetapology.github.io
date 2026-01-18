/* =====================================================
   BACKGROUND PIXEL HEARTS (SEAMLESS FLOW)
   ===================================================== */

const bgCanvas = document.getElementById("bgCanvas");
const bgCtx = bgCanvas.getContext("2d");

function resizeBG() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeBG();
window.addEventListener("resize", resizeBG);

const heartImg = new Image();
heartImg.src = "shrut-heart.png";

const HEART_COUNT = 16;
const bgHearts = [];

/* Create heart OFF-SCREEN only */
function createHeart(initial = false) {
  return {
    x: Math.random() * bgCanvas.width,
    y: initial
      ? Math.random() * bgCanvas.height
      : bgCanvas.height + Math.random() * 200,
    size: 42 + Math.random() * 26,
    speed: 0.22 + Math.random() * 0.22,
    opacity: 0.22 + Math.random() * 0.12
  };
}

/* Initialize once */
function initHearts() {
  bgHearts.length = 0;
  for (let i = 0; i < HEART_COUNT; i++) {
    bgHearts.push(createHeart(true));
  }
}

/* Seamless animation loop */
function animateBG() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgCtx.imageSmoothingEnabled = false;

  for (let i = 0; i < bgHearts.length; i++) {
    const h = bgHearts[i];

    h.y -= h.speed;

    bgCtx.globalAlpha = h.opacity;
    bgCtx.drawImage(
      heartImg,
      h.x,
      h.y,
      h.size,
      h.size
    );

    /* Recycle ONLY after fully leaving screen */
    if (h.y < -h.size - 50) {
      h.y = bgCanvas.height + 200 + Math.random() * 200;
      h.x = Math.random() * bgCanvas.width;
    }
  }

  bgCtx.globalAlpha = 1;
  requestAnimationFrame(animateBG);
}

heartImg.onload = () => {
  initHearts();
  animateBG();
};

/* =====================================================
   MAIN HEART (UNCHANGED — DO NOT TOUCH)
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
