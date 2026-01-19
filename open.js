const card = document.getElementById("card");
const overlay = document.getElementById("overlay");

card.addEventListener("click", () => {
  overlay.classList.add("active");
});
