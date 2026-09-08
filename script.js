const openButton = document.getElementById("openButton");

openButton.addEventListener("click", () => {
  document.body.classList.add("page-leave");

  setTimeout(() => {
    window.location.href = "birthday.html";
  }, 550);
});
