const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");

const afterHeart = document.getElementById("afterHeart");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const answer = document.getElementById("answer");
const buttons = document.getElementById("buttons");

const color = "#c97a7a";
ctx.strokeStyle = color;
ctx.lineWidth = 2.2;
ctx.lineCap = "round";
ctx.lineJoin = "round";

let t = 0;
const duration = 540; // ~9 seconds at 60fps

function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  return { x, y };
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  for (let i = 0; i < t; i++) {
    const p = heartPoint((i / duration) * Math.PI * 2);
    const cx = canvas.width / 2 + p.x * 8;
    const cy = canvas.height / 2 - p.y * 8;
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }

  ctx.stroke();

  if (t < duration) {
    t++;
    requestAnimationFrame(draw);
  } else {
    afterHeart.textContent = "I’m taking responsibility.";
  }
}

draw();

yesBtn.addEventListener("click", () => {
  buttons.style.display = "none";
  answer.textContent = "Thank you for trusting me.";
});

noBtn.addEventListener("click", () => {
  buttons.style.display = "none";
  answer.textContent = "I understand. I’m still here.";
});
