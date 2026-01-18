/* =====================================================
   BACKGROUND PIXEL HEARTS (SMOOTH LOOP)
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

const HEART_COUNT = 14;
const bgHearts = [];

function initHearts() {
  bgHearts.length = 0;
  for (let i = 0; i < HEART_COUNT; i++) {
    bgHearts.push(createHeart(true));
  }
}

function createHeart(randomY = false) {
  return {
    x: Math.random() * bgCanvas.width,
    y: randomY
      ? Math.random() * bgCanvas.height
      : bgCanvas.height + Math.random() * 100,
    size: 40 + Math.random() * 25,
    speed: 0.25 + Math.random() * 0.25,
    opacity: 0.18 + Math.random() * 0.12
  };
}

function animateBGHearts() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgCtx.imageSmoothingEnabled = false;

  bgHearts.forEach(h => {
    h.y -= h.speed;

    bgCtx.globalAlpha = h.opacity;
    bgCtx.drawImage(heartImg, h.x, h.y, h.size, h.size);

    /* Loop smoothly back to bottom */
    if (h.y < -h.size) {
      h.y = bgCanvas.height + Math.random() * 80;
      h.x = Math.random() * bgCanvas.width;
    }
  });

  bgCtx.globalAlpha = 1;
  requestAnimationFrame(animateBGHearts);
}

heartImg.onload = () => {
  initHearts();
  animateBGHearts();
};

/* =====================================================
   MAIN HEART (DO NOT EDIT LOGIC)
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
