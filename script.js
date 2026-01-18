/* ===================== MAIN HEART ===================== */
const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");

const bgCanvas = document.getElementById("bgCanvas");
const bgCtx = bgCanvas.getContext("2d");

const afterHeart = document.getElementById("afterHeart");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const answer = document.getElementById("answer");
const buttons = document.getElementById("buttons");

bgCanvas.width = window.innerWidth;
bgCanvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
});

const color = "#c97a7a";
ctx.strokeStyle = color;
ctx.lineWidth = 2.2;
ctx.lineCap = "round";
ctx.lineJoin = "round";

function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  return { x, y };
}

let progress = 0;
const duration = 560;
let finished = false;

/* ===================== DRAW MAIN HEART ===================== */
function drawHeart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  for (let i = 0; i < progress; i++) {
    const p = heartPoint((i / duration) * Math.PI * 2);
    const cx = canvas.width / 2 + p.x * 8;
    const cy = canvas.height / 2 - p.y * 8;
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }

  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (progress < duration) {
    progress++;
    requestAnimationFrame(drawHeart);
  } else if (!finished) {
    finished = true;
    afterHeart.textContent = "I’m taking responsibility.";
    startBackgroundHearts();
  }
}

drawHeart();

/* ===================== BACKGROUND HEARTS ===================== */
let bgHearts = [];

function spawnBgHeart() {
  bgHearts.push({
    x: Math.random() * bgCanvas.width,
    y: bgCanvas.height + 100,
    size: 120 + Math.random() * 120,
    speed: 0.15 + Math.random() * 0.2,
    opacity: 0.035 + Math.random() * 0.02
  });
}

function drawBgHeart(h) {
  bgCtx.beginPath();
  for (let i = 0; i < 100; i++) {
    const p = heartPoint((i / 100) * Math.PI * 2);
    const cx = h.x + p.x * (h.size / 16);
    const cy = h.y - p.y * (h.size / 16);
    if (i === 0) bgCtx.moveTo(cx, cy);
    else bgCtx.lineTo(cx, cy);
  }
  bgCtx.stroke();
}

function animateBackground() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  bgCtx.strokeStyle = color;
  bgCtx.lineWidth = 1.2;

  bgHearts.forEach((h, index) => {
    bgCtx.globalAlpha = h.opacity;
    drawBgHeart(h);
    h.y -= h.speed;

    if (h.y < -200) bgHearts.splice(index, 1);
  });

  bgCtx.globalAlpha = 1;
  requestAnimationFrame(animateBackground);
}

function startBackgroundHearts() {
  spawnBgHeart();
  animateBackground();

  setInterval(() => {
    if (bgHearts.length < 2) spawnBgHeart();
  }, 16000);
}

/* ===================== INTERACTION ===================== */
yesBtn.addEventListener("click", () => {
  buttons.style.display = "none";
  answer.textContent = "Thank you for trusting me.";
});

noBtn.addEventListener("click", () => {
  buttons.style.display = "none";
  answer.textContent = "I understand. I’m still here.";
});
