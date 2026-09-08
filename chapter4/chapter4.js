const introScreen = document.getElementById("introScreen");
const countdownScreen = document.getElementById("countdownScreen");
const gameScreen = document.getElementById("gameScreen");
const finishScreen = document.getElementById("finishScreen");

const startButton = document.getElementById("startButton");
const nextButton = document.getElementById("nextButton");

const countdownEl = document.getElementById("countdown");
const playfield = document.getElementById("playfield");
const catcherEl = document.getElementById("catcher");

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const finalTimeEl = document.getElementById("finalTime");
const finalScoreEl = document.getElementById("finalScore");
const resultMessageEl = document.getElementById("resultMessage");

const floatingText = document.getElementById("floatingText");
const dangerFlash = document.getElementById("dangerFlash");
const pageTransition = document.getElementById("pageTransition");

const langEN = document.getElementById("langEN");
const langID = document.getElementById("langID");

const rewardSection = document.getElementById("rewardSection");
const couponResult = document.getElementById("couponResult");
const couponTitle = document.getElementById("couponTitle");

const rewardOptions = [
  ...document.querySelectorAll(".reward-option")
];

let language = localStorage.getItem("birthdayLanguage") || "en";

let score = 0;
let timeLeft = 20;

let running = false;
let finished = false;

let hearts = [];
let catcherX = 0;
let catcherTargetX = 0;

let animationFrame = 0;
let timerId = null;
let lastTime = 0;

const HEART_COUNT = 5;
const TARGET = 15;
const TOTAL_TIME = 20;


/* =========================================================
   LANGUAGE
========================================================= */

function applyLanguage(lang) {
  language = lang;

  document.documentElement.lang = lang;

  document
    .querySelectorAll("[data-en][data-id]")
    .forEach(element => {
      element.innerHTML = element.dataset[lang];
    });

  if (langEN) {
    langEN.classList.toggle("active", lang === "en");
  }

  if (langID) {
    langID.classList.toggle("active", lang === "id");
  }

  localStorage.setItem("birthdayLanguage", lang);
}

if (langEN) {
  langEN.addEventListener("click", () => {
    applyLanguage("en");
  });
}

if (langID) {
  langID.addEventListener("click", () => {
    applyLanguage("id");
  });
}


/* =========================================================
   PAGE TRANSITION
========================================================= */

function transition(action, delay = 520) {

  if (!pageTransition) {
    action();
    return;
  }

  if (pageTransition.classList.contains("running")) {
    return;
  }

  pageTransition.classList.add("running");

  setTimeout(() => {
    action();
  }, delay);

  setTimeout(() => {
    pageTransition.classList.remove("running");
  }, delay + 430);
}


/* =========================================================
   SCREEN CHANGE
========================================================= */

function showScreen(screen) {

  const screens = [
    introScreen,
    countdownScreen,
    gameScreen,
    finishScreen
  ];

  screens.forEach(s => {

    if (!s) return;

    s.classList.remove("active");
    s.hidden = true;

  });

  if (!screen) return;

  screen.hidden = false;

  requestAnimationFrame(() => {

    requestAnimationFrame(() => {

      screen.classList.add("active");

    });

  });
}


/* =========================================================
   START GAME
========================================================= */

if (startButton) {

  startButton.addEventListener("click", () => {

    transition(() => {

      showScreen(countdownScreen);

      runCountdown();

    });

  });

}


/* =========================================================
   COUNTDOWN
========================================================= */

function runCountdown() {

  let count = 3;

  countdownEl.textContent = count;

  const id = setInterval(() => {

    count--;

    if (count > 0) {

      countdownEl.textContent = count;

    } else {

      clearInterval(id);

      transition(() => {

        startGame();

      });

    }

  }, 800);

}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

  score = 0;
  timeLeft = TOTAL_TIME;

  running = true;
  finished = false;

  scoreEl.textContent = "0";
  timeEl.textContent = TOTAL_TIME;

  resultMessageEl.textContent = "";
  resultMessageEl.classList.remove("success");

  if (rewardSection) {
    rewardSection.hidden = true;
  }

  if (couponResult) {
    couponResult.hidden = true;
  }

  rewardOptions.forEach(option => {

    option.classList.remove("selected");
    option.disabled = false;

  });

  const rect = playfield.getBoundingClientRect();

  catcherX = rect.width / 2;
  catcherTargetX = catcherX;

  resetHearts();

  showScreen(gameScreen);

  lastTime = performance.now();

  cancelAnimationFrame(animationFrame);

  animationFrame = requestAnimationFrame(gameLoop);

  clearInterval(timerId);

  timerId = setInterval(() => {

    if (!running) return;

    timeLeft--;

    timeEl.textContent = Math.max(0, timeLeft);

    if (timeLeft <= 0) {

      endGame(false);

    }

  }, 1000);

}


/* =========================================================
   HEART
========================================================= */

function createHeart() {

  const rect = playfield.getBoundingClientRect();

  const el = document.createElement("div");

  el.className = "falling-heart";

  el.textContent = "♡";

  playfield.appendChild(el);

  const heart = {

    el,

    x:
      30 +
      Math.random() *
      Math.max(30, rect.width - 60),

    y:
      -30 -
      Math.random() * 140,

    vx:
      (Math.random() - 0.5) * 60,

    speed:
      220 +
      Math.random() * 45

  };

  hearts.push(heart);

  return heart;

}


/* =========================================================
   RESET HEARTS
========================================================= */

function resetHearts() {

  hearts.forEach(heart => {

    if (heart.el) {
      heart.el.remove();
    }

  });

  hearts = [];

  for (let i = 0; i < HEART_COUNT; i++) {

    createHeart();

  }

}


/* =========================================================
   RECYCLE HEART
========================================================= */

function recycleHeart(heart) {

  const rect = playfield.getBoundingClientRect();

  heart.x =
    30 +
    Math.random() *
    Math.max(30, rect.width - 60);

  heart.y =
    -30 -
    Math.random() * 90;

  heart.vx =
    (Math.random() - 0.5) * 60;

  heart.speed =
    220 +
    Math.min(score * 5, 60) +
    Math.random() * 45;

}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(now) {

  if (!running) return;

  const delta =
    Math.min(
      (now - lastTime) / 1000,
      0.035
    );

  lastTime = now;

  const rect =
    playfield.getBoundingClientRect();


  /* catcher movement */

  catcherX +=
    (catcherTargetX - catcherX) *
    Math.min(1, delta * 12);

  catcherEl.style.left =
    `${catcherX}px`;


  /* hearts */

  for (
    let i = hearts.length - 1;
    i >= 0;
    i--
  ) {

    const heart = hearts[i];

    heart.y +=
      heart.speed * delta;

    heart.x +=
      heart.vx * delta;


    /* wall */

    if (heart.x < 30) {

      heart.x = 30;

      heart.vx *= -1;

    }

    if (heart.x > rect.width - 30) {

      heart.x = rect.width - 30;

      heart.vx *= -1;

    }


    heart.el.style.left =
      `${heart.x}px`;

    heart.el.style.top =
      `${heart.y}px`;


    /* collision */

    const catcherTop =
      rect.height - 63;

    const half =
      56;


    if (
      heart.y >= catcherTop - 14 &&
      heart.y <= catcherTop + 24 &&
      heart.x >= catcherX - half &&
      heart.x <= catcherX + half
    ) {

      catchHeart(heart);

      continue;

    }


    /* missed */

    if (
      heart.y >
      rect.height + 45
    ) {

      missHeart(heart);

    }

  }


  animationFrame =
    requestAnimationFrame(gameLoop);

}


/* =========================================================
   CATCH HEART
========================================================= */

function catchHeart(heart) {

  if (!running) return;

  score++;

  scoreEl.textContent =
    score;

  catcherEl.classList.add("active");

  setTimeout(() => {

    catcherEl.classList.remove("active");

  }, 160);


  showFloatingText(
    "+1 ♡",
    heart.x,
    heart.y
  );


  recycleHeart(heart);


  if (score >= TARGET) {

    endGame(true);

  }

}


/* =========================================================
   MISS HEART
========================================================= */

function missHeart(heart) {

  if (!running) return;

  showFloatingText(

    language === "id"
      ? "jangan jatuh..."
      : "don't let it fall...",

    heart.x,

    Math.min(
      heart.y,
      playfield.clientHeight - 70
    )

  );


  dangerFlash.classList.remove("show");

  void dangerFlash.offsetWidth;

  dangerFlash.classList.add("show");


  recycleHeart(heart);

}


/* =========================================================
   FLOATING TEXT
========================================================= */

function showFloatingText(text, x, y) {

  floatingText.textContent =
    text;

  floatingText.style.left =
    `${x}px`;

  floatingText.style.top =
    `${y}px`;

  floatingText.classList.remove("show");

  void floatingText.offsetWidth;

  floatingText.classList.add("show");

}


/* =========================================================
   END GAME
========================================================= */

function endGame(won) {

  if (!running || finished) return;

  running = false;
  finished = true;

  clearInterval(timerId);

  cancelAnimationFrame(animationFrame);


  finalScoreEl.textContent =
    `${score} / ${TARGET}`;

  finalTimeEl.textContent =
    `${Math.max(0, timeLeft)}s`;


  const success =
    score === TARGET;


  if (success) {

    resultMessageEl.textContent =
      language === "id"
        ? "Yeayy"
        : "Yeayy";

    resultMessageEl.classList.add("success");


    if (
      typeof confetti === "function" &&
      !window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {

      confetti({

        particleCount: 120,

        spread: 90,

        startVelocity: 34,

        gravity: 0.9,

        scalar: 0.85,

        origin: {
          x: 0.5,
          y: 0.62
        },

        colors: [
          "#506873",
          "#718a95",
          "#d39d98",
          "#f5eee4"
        ],

        disableForReducedMotion: true

      });

    }


    if (rewardSection) {

      rewardSection.hidden = false;

    }

  } else {

    resultMessageEl.textContent =
      language === "id"
        ? "Jangan Menyerah"
        : "Don't Give Up";

    resultMessageEl.classList.remove("success");


    if (rewardSection) {

      rewardSection.hidden = true;

    }

  }


  /*
   * PENTING:
   * Finish screen muncul setelah transition.
   */

  transition(() => {

    showScreen(finishScreen);

  }, 520);

}


/* =========================================================
   CATCHER MOVEMENT
========================================================= */

function moveCatcher(clientX) {

  const rect =
    playfield.getBoundingClientRect();

  catcherTargetX =
    Math.max(
      56,
      Math.min(
        rect.width - 56,
        clientX - rect.left
      )
    );

}


playfield.addEventListener(
  "pointerdown",
  event => {

    moveCatcher(event.clientX);

  }
);


playfield.addEventListener(
  "pointermove",
  event => {

    if (
      event.pointerType === "mouse" ||
      event.buttons > 0 ||
      event.pressure > 0
    ) {

      moveCatcher(event.clientX);

    }

  }
);


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (!running) return;

    const step = 46;


    if (event.key === "ArrowLeft") {

      catcherTargetX -= step;

      event.preventDefault();

    }


    if (event.key === "ArrowRight") {

      catcherTargetX += step;

      event.preventDefault();

    }


    const rect =
      playfield.getBoundingClientRect();


    catcherTargetX =
      Math.max(
        56,
        Math.min(
          rect.width - 56,
          catcherTargetX
        )
      );

  }
);


/* =========================================================
   REWARD OPTIONS
========================================================= */

rewardOptions.forEach(option => {

  option.addEventListener(
    "click",
    () => {

      rewardOptions.forEach(item => {

        item.classList.remove("selected");

      });


      option.classList.add("selected");


      if (couponTitle) {

        couponTitle.textContent =
          language === "id"
            ? (
                option.dataset.titleId ||
                option.dataset.caption ||
                "YEAYY DAPAT HADIAH ♡"
              )
            : (
                option.dataset.titleEn ||
                option.dataset.caption ||
                "YEAYY YOU GOT A REWARD ♡"
              );

      }


      if (couponResult) {

        couponResult.hidden = false;

        requestAnimationFrame(() => {

          couponResult.scrollIntoView({

            behavior: "smooth",

            block: "center"

          });

        });

      }


      rewardOptions.forEach(item => {

        item.disabled = true;

      });

    }
  );

});


/* =========================================================
   NEXT CHAPTER
   CHAPTER 4 ADA DI /chapter4
   CHAPTER 5 ADA DI ROOT
========================================================= */

if (nextButton) {

  nextButton.addEventListener(
    "click",
    event => {

      event.preventDefault();

      /*
       * Jangan langsung pindah halaman.
       * Jalankan transition terlebih dahulu.
       */

      if (
        pageTransition &&
        pageTransition.classList.contains("running")
      ) {
        return;
      }


      if (pageTransition) {

        pageTransition.classList.add("running");

      }


      setTimeout(() => {

        /*
         * ../ berarti keluar dari folder chapter4
         * lalu masuk ke chapter5.html
         */

        window.location.href =
          "../chapter5.html";

      }, 650);

    }
  );

}


/* =========================================================
   INITIALIZE
========================================================= */

applyLanguage(language);