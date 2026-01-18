/* ===============================
   BACKGROUND FLOATING PIXEL HEARTS
   Requires: shrut-heart.png
   =============================== */

const bgCanvas = document.getElementById("bgCanvas");
const bgCtx = bgCanvas.getContext("2d");

function resizeBG() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeBG();
window.addEventListener("resize", resizeBG);

/* Load pixel heart */
const heartImg = new Image();
heartImg.src = "shrut-heart.png";

/* Store hearts */
const hearts = [];
const MAX_HEARTS = 15;

/* Create heart */
function spawnHeart() {
  if (hearts.length >= MAX_HEARTS) return;

  hearts.push({
    x: Math.random() * bgCanvas.width,
    y: bgCanvas.height + 40,
    size: 40 + Math.random() * 30,
    speed: 0.3 + Math.random() * 0.4,
    opacity: 0,
    phase: "in"
  });
}

/* Animate hearts */
function animateHearts() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgCtx.imageSmoothingEnabled = false;

  hearts.forEach((h, i) => {
    if (h.phase === "in") {
      h.opacity += 0.015;
      if (h.opacity >= 0.28) h.phase = "out";
    } else {
      h.opacity -= 0.002;
    }

    h.y -= h.speed;

    bgCtx.globalAlpha = h.opacity;
    bgCtx.drawImage(heartImg, h.x, h.y, h.size, h.size);

    if (h.opacity <= 0 || h.y < -100) {
      hearts.splice(i, 1);
    }
  });

  bgCtx.globalAlpha = 1;
  requestAnimationFrame(animateHearts);
}

/* Start background hearts */
heartImg.onload = () => {
  spawnHeart();
  setInterval(spawnHeart, 700);
  animateHearts();
};

/* ===============================
   MAIN HEART DRAW (CENTER)
   =============================== */

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

/* ===============================
   BUTTON INTERACTION
   =============================== */

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
