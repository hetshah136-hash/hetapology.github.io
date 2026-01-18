const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");

const afterHeart = document.getElementById("afterHeart");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const answer = document.getElementById("answer");
const buttons = document.getElementById("buttons");

/* ===== Heart styling ===== */
const color = "#c97a7a"; // muted rose
ctx.strokeStyle = color;
ctx.lineWidth = 2.2;
ctx.lineCap = "round";
ctx.lineJoin = "round";

/* ===== Heart math ===== */
function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  return { x, y };
}

/* ===== Drawing control ===== */
let progress = 0;
const duration = 560; // ~9 seconds
let finished = false;
let pulse = 0;

/* ===== Initial draw (effort) ===== */
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

  // Soft glow while drawing
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
    requestAnimationFrame(breatheHeart);
  }
}

/* ===== Breathing animation (care continues) ===== */
function breatheHeart() {
  pulse += 0.01;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  for (let i = 0; i < duration; i++) {
    const p = heartPoint((i / duration) * Math.PI * 2);
    const scale = 8 + Math.sin(pulse) * 0.18;
    const cx = canvas.width / 2 + p.x * scale;
    const cy = canvas.height / 2 - p.y * scale;
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.stroke();
  ctx.shadowBlur = 0;

  requestAnimationFrame(breatheHeart);
}

/* ===== Start drawing immediately ===== */
drawHeart();

/* ===== Interaction (mature, calm) ===== */
yesBtn.addEventListener("click", () => {
  buttons.style.display = "none";
  answer.textContent = "Thank you for trusting me.";
});

noBtn.addEventListener("click", () => {
  buttons.style.display = "none";
  answer.textContent = "I understand. I’m still here.";
});
