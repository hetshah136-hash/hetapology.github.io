const card = document.getElementById("card");
const overlay = document.getElementById("overlay");

card.addEventListener("click", () => {
  card.style.opacity = "0";
  overlay.classList.add("active");
});
