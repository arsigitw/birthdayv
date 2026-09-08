const hearts = document.getElementById("hearts");
const continueButton = document.getElementById("continueButton");

function createHearts() {
  const symbols = ["♡", "✦", "·"];

  for (let i = 0; i < 18; i++) {
    const heart = document.createElement("span");
    heart.className = "confetti-heart";
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${12 + Math.random() * 18}px`;
    heart.style.animationDuration = `${5 + Math.random() * 5}s`;
    heart.style.animationDelay = `${Math.random() * 3}s`;
    hearts.appendChild(heart);
  }
}

createHearts();

continueButton.addEventListener("click", () => {
  document.body.classList.add("page-leave");

  setTimeout(() => {
    window.location.href = "chapter3.html";
  }, 700);
});
