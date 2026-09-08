const pages = [...document.querySelectorAll(".page")];
const progressFill = document.getElementById("progressFill");
const hint = document.getElementById("hint");
const pageTransition = document.getElementById("pageTransition");

const langEN = document.getElementById("langEN");
const langID = document.getElementById("langID");

const rainContainer = document.getElementById("doodleRain");

let currentPage = 0;
let isAnimating = false;

const savedLanguage = localStorage.getItem("birthdayLanguage") || "en";
let currentLanguage = savedLanguage;

/* =========================================================
   LANGUAGE
   ========================================================= */

function applyLanguage(language) {
  currentLanguage = language;

  document.documentElement.lang = language;

  document.querySelectorAll("[data-en][data-id]").forEach((element) => {
    element.innerHTML = element.dataset[language];
  });

  langEN.classList.toggle("active", language === "en");
  langID.classList.toggle("active", language === "id");

  localStorage.setItem("birthdayLanguage", language);
}

langEN.addEventListener("click", () => applyLanguage("en"));
langID.addEventListener("click", () => applyLanguage("id"));

/* =========================================================
   PAGE TRANSITION
   ========================================================= */

function updateProgress() {
  const percentage = ((currentPage + 1) / pages.length) * 100;
  progressFill.style.width = `${percentage}%`;

  hint.style.opacity = currentPage === pages.length - 1 ? "0" : "0.7";
}

function goToPage(targetIndex, direction = 1) {
  if (
    isAnimating ||
    targetIndex < 0 ||
    targetIndex >= pages.length ||
    targetIndex === currentPage
  ) {
    return;
  }

  isAnimating = true;

  const oldPage = pages[currentPage];
  const newPage = pages[targetIndex];

  // Prepare the next page before the transition covers the screen.
  newPage.classList.remove("exit");
  newPage.style.transform =
    direction > 0
      ? "translate3d(7%, 0, 0) scale(.985)"
      : "translate3d(-7%, 0, 0) scale(.985)";

  // Start the full-screen cover animation.
  pageTransition.classList.add("is-running");

  setTimeout(() => {
    // During the cover, switch the page underneath it.
    oldPage.classList.remove("active");
    oldPage.classList.add("exit");

    newPage.classList.add("active");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newPage.style.transform = "";
      });
    });

    currentPage = targetIndex;
    updateProgress();

    // Reverse the cover to reveal the new page.
    setTimeout(() => {
      pageTransition.classList.remove("is-running");
    }, 180);

  }, 470);

  setTimeout(() => {
    oldPage.classList.remove("exit");
    newPage.style.transform = "";
    isAnimating = false;
  }, 980);
}

document.querySelectorAll(".home-btn").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (isAnimating) return;

    isAnimating = true;
    pageTransition.classList.add("is-running");

    setTimeout(() => {
      window.location.href = link.href;
    }, 620);
  });
});

document.querySelectorAll(".next-btn").forEach((button) => {
  button.addEventListener("click", () => {
    goToPage(Number(button.dataset.next), 1);
  });
});

/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    goToPage(currentPage + 1, 1);
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    goToPage(currentPage - 1, -1);
  }
});

/* =========================================================
   MOUSE WHEEL
   ========================================================= */

let wheelLock = false;

window.addEventListener(
  "wheel",
  (event) => {
    if (wheelLock || Math.abs(event.deltaY) < 20) return;

    const activePage = pages[currentPage];
    const maxScroll = activePage.scrollHeight - activePage.clientHeight;
    const scrollingDown = event.deltaY > 0;
    const canScrollInsidePage =
      maxScroll > 8 &&
      ((scrollingDown && activePage.scrollTop < maxScroll - 4) ||
        (!scrollingDown && activePage.scrollTop > 4));

    // Let the page scroll normally while there is still content
    // available in the direction of the wheel movement.
    if (canScrollInsidePage) return;

    wheelLock = true;

    goToPage(
      currentPage + (scrollingDown ? 1 : -1),
      scrollingDown ? 1 : -1
    );

    setTimeout(() => {
      wheelLock = false;
    }, 1000);
  },
  { passive: true }
);

/* =========================================================
   TOUCH / SWIPE
   ========================================================= */

let touchStartY = 0;

window.addEventListener(
  "touchstart",
  (event) => {
    touchStartY = event.changedTouches[0].clientY;
  },
  { passive: true }
);

window.addEventListener(
  "touchend",
  (event) => {
    const distance = touchStartY - event.changedTouches[0].clientY;
    if (Math.abs(distance) <= 55) return;

    const activePage = pages[currentPage];
    const maxScroll = activePage.scrollHeight - activePage.clientHeight;
    const swipingUp = distance > 0;
    const canScrollInsidePage =
      maxScroll > 8 &&
      ((swipingUp && activePage.scrollTop < maxScroll - 4) ||
        (!swipingUp && activePage.scrollTop > 4));

    // On tall pages, use the swipe for normal scrolling until the
    // user reaches the relevant edge. Only then turn the chapter page.
    if (canScrollInsidePage) return;

    goToPage(
      currentPage + (swipingUp ? 1 : -1),
      swipingUp ? 1 : -1
    );
  },
  { passive: true }
);

/* =========================================================
   DOODLE RAIN — requestAnimationFrame
   ========================================================= */

const doodleSymbols = [
  "♡", "♡", "✦", "✧", "✿", "☆", "☼", "⌁", "·", "✧"
];

const doodleColors = [
  "#506873",
  "#718a95",
  "#8d6f68",
  "#6f7979",
  "#9a8f7c"
];

const activeRain = [];
let lastSpawn = 0;

function spawnDoodle() {
  const el = document.createElement("span");

  el.className = "rain-doodle";

  const width = window.innerWidth;
  const height = window.innerHeight;

  const size = 14 + Math.random() * 25;
  const startX = Math.random() * width;
  const startY = -40 - Math.random() * 120;

  const speed = 45 + Math.random() * 70;
  const drift = (-35 + Math.random() * 70);
  const rotationSpeed = -40 + Math.random() * 80;
  const startRotation = -30 + Math.random() * 60;
  const opacity = 0.35 + Math.random() * 0.4;

  el.textContent =
    doodleSymbols[Math.floor(Math.random() * doodleSymbols.length)];

  el.style.fontSize = `${size}px`;
  el.style.color =
    doodleColors[Math.floor(Math.random() * doodleColors.length)];

  const item = {
    el,
    x: startX,
    y: startY,
    speed,
    drift,
    rotation: startRotation,
    rotationSpeed,
    opacity,
    born: performance.now(),
  };

  el.style.opacity = "0";

  rainContainer.appendChild(el);
  activeRain.push(item);

  // Fade in naturally as it enters the scene.
  requestAnimationFrame(() => {
    el.style.opacity = String(opacity);
  });
}

function updateDoodleRain(now) {
  const delta = Math.min((now - (updateDoodleRain.last || now)) / 1000, 0.05);
  updateDoodleRain.last = now;

  // Spawn roughly 3 doodles per second continuously.
  if (now - lastSpawn > 330) {
    spawnDoodle();
    lastSpawn = now;
  }

  for (let i = activeRain.length - 1; i >= 0; i--) {
    const item = activeRain[i];

    const age = (now - item.born) / 1000;

    item.y += item.speed * delta;
    item.x += Math.sin(age * 1.5) * item.drift * delta;
    item.rotation += item.rotationSpeed * delta;

    const progress = item.y / window.innerHeight;

    // Slight fade at the top and bottom.
    let alpha = item.opacity;

    if (progress < 0.08) {
      alpha *= progress / 0.08;
    } else if (progress > 0.88) {
      alpha *= Math.max(0, (1 - progress) / 0.12);
    }

    item.el.style.opacity = String(alpha);

    item.el.style.transform =
      `translate3d(${item.x}px, ${item.y}px, 0) rotate(${item.rotation}deg)`;

    // Remove once below screen.
    if (item.y > window.innerHeight + 70) {
      item.el.remove();
      activeRain.splice(i, 1);
    }
  }

  requestAnimationFrame(updateDoodleRain);
}

function startDoodleRain() {
  // Create a visible starting field immediately.
  for (let i = 0; i < 18; i++) {
    const timeout = i * 90;

    setTimeout(() => {
      spawnDoodle();

      // Place initial doodles across different heights.
      const item = activeRain[activeRain.length - 1];

      if (item) {
        item.y = Math.random() * window.innerHeight;
      }
    }, timeout);
  }

  requestAnimationFrame(updateDoodleRain);
}

startDoodleRain();

/* =========================================================
   INIT
   ========================================================= */

applyLanguage(savedLanguage);
progressFill.style.width = "20%";
hint.style.opacity = "0.7";
