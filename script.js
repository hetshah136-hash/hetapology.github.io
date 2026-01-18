/* ===== Canvas Setup ===== */
const mainCanvas = document.getElementById("heartCanvas");
const mainCtx = mainCanvas.getContext("2d");

const bgCanvas = document.getElementById("bgCanvas");
const bgCtx = bgCanvas.getContext("2d");

bgCanvas.width = window.innerWidth;
bgCanvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
});

/* ===== DOM ===== */
const afterHeart = document.getElementById("afterHeart");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const answer = document.getElementById("answer");
const buttons = document.getElementById("buttons");

/* ===== Heart Math ===== */
const color = "#c97a7a";

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

/* ===== Main Heart ===== */
let progress = 0;
const duration = 520;

function drawMainHeart() {
  mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
  mainCtx.beginPath();

  for (let i = 0; i < progress; i++) {
    const p = heartPoint((i / duration) * Math.PI * 2);
    const x = mainCanvas.width / 2 + p.x * 8;
    const y = mainCanvas.height / 2 - p.y * 8;
    if (i === 0) mainCtx.moveTo(x, y);
    else mainCtx.lineTo(x, y);
  }

  mainCtx.strokeStyle = color;
  mainCtx.lineWidth = 2.2;
  mainCtx.shadowColor = color;
  mainCtx.shadowBlur = 10;
  mainCtx.stroke();
  mainCtx.shadowBlur = 0;

  if (progress < duration) {
    progress++;
    requestAnimationFrame(drawMainHeart);
  } else {
    afterHeart.textContent = "I’m taking responsibility.";
  }
}

drawMainHeart();

/* ===== Background Hearts ===== */
let bgHearts = [];

function spawnBgHeart() {
  bgHearts.push({
    x: Math.random() * bgCanvas.width,
    y: bgCanvas.height + 150,
    size: 140 + Math.random() * 160,
    speed: 0.4 + Math.random() * 0.3,
    opacity: 0.12 + Math.random() * 0.06
  });
}

function drawBgHeart(h) {
  bgCtx.beginPath();
  for (let i = 0; i < 100; i++) {
    const p = heartPoint((i / 100) * Math.PI * 2);
    const x = h.x + p.x * (h.size / 16);
    const y = h.y - p.y * (h.size / 16);
    if (i === 0) bgCtx.moveTo(x, y);
    else bgCtx.lineTo(x, y);
  }
  bgCtx.stroke();
}

function animateBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgCtx.strokeStyle = color;
  bgCtx.lineWidth = 1.4;

  bgHearts.forEach((h, i) => {
    bgCtx.globalAlpha = h.opacity;
    drawBgHeart(h);
    h.y -= h.speed;
    if (h.y < -200) bgHearts.splice(i, 1);
  });

  bgCtx.globalAlpha = 1;
  requestAnimationFrame(animateBg);
}

/* Start background hearts */
spawnBgHeart();
setInterval(spawnBgHeart, 8000);
animateBg();

/* ===== Interaction ===== */
yesBtn.addEventListener("click", () => {
  buttons.style.display = "none";
  answer.textContent = "Thank you for trusting me.";
});

noBtn.addEventListener("click", () => {
  buttons.style.display = "none";
  answer.textContent = "I understand. I’m still here.";
});
