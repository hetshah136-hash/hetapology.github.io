const card = document.getElementById("card");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("close");

card.addEventListener("click", () => {
  overlay.classList.add("active");
});

closeBtn.addEventListener("click", () => {
  overlay.classList.remove("active");
});
