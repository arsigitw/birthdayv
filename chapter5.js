const pages = [...document.querySelectorAll(".page")];
const transition = document.getElementById("transition");
const rain = document.getElementById("rain");
const again = document.getElementById("again");

let current = 0;
let locked = false;

const symbols = [
  "♡",
  "✦",
  "✧",
  "✿",
  "·",
  "☆",
  "⌁"
];


/* =====================================================
   DOODLE RAIN
===================================================== */

function doodle() {

  const s = document.createElement("span");

  s.textContent =
    symbols[Math.floor(Math.random() * symbols.length)];

  s.style.left =
    Math.random() * 100 + "vw";

  s.style.fontSize =
    11 + Math.random() * 18 + "px";

  s.style.setProperty(
    "--drift",
    (-90 + Math.random() * 180) + "px"
  );

  s.style.setProperty(
    "--rot",
    (-180 + Math.random() * 360) + "deg"
  );

  const duration =
    4 + Math.random() * 5;

  s.style.animationDuration =
    duration + "s";

  rain.appendChild(s);

  setTimeout(() => {

    s.remove();

  }, duration * 1000 + 300);
}


/* Doodle terus muncul */

setInterval(doodle, 280);


/* Doodle awal */

for (let i = 0; i < 18; i++) {

  setTimeout(
    doodle,
    i * 100
  );

}


/* =====================================================
   PAGE TRANSITION
===================================================== */

function go(target) {

  target = Number(target);

  /*
   * Jangan izinkan klik berkali-kali
   * ketika animasi sedang berjalan.
   */

  if (locked) return;

  if (
    target < 0 ||
    target >= pages.length ||
    target === current
  ) {
    return;
  }

  locked = true;


  /*
   * Jalankan overlay transition
   */

  transition.classList.add("show");


  /*
   * Tunggu overlay menutup halaman
   */

  setTimeout(() => {

    const oldPage =
      pages[current];

    const nextPage =
      pages[target];


    /*
     * Halaman lama keluar
     */

    oldPage.classList.remove("active");

    oldPage.classList.add("leaving");


    /*
     * Halaman baru masuk
     */

    nextPage.classList.add("active");


    /*
     * Tunggu animasi halaman selesai
     */

    setTimeout(() => {

      oldPage.classList.remove("leaving");

      current = target;

      transition.classList.remove("show");

      locked = false;

    }, 750);

  }, 300);
}


/* =====================================================
   NEXT BUTTON
===================================================== */

document
  .querySelectorAll(".next")
  .forEach(button => {

    button.addEventListener(
      "click",
      event => {

        event.preventDefault();

        const target =
          button.dataset.target;

        go(target);

      }
    );

  });


/* =====================================================
   READ AGAIN
===================================================== */

if (again) {

  again.addEventListener(
    "click",
    event => {

      event.preventDefault();

      /*
       * Kalau masih berada di halaman final,
       * kita tidak perlu menggunakan go(0),
       * karena setelah kembali ke halaman pertama
       * kita memang ingin kembali ke INDEX.
       */

      if (locked) return;

      locked = true;

      /*
       * Mulai animasi transition
       */

      transition.classList.add("show");


      /*
       * Tunggu sampai transition menutup layar,
       * kemudian pindah ke index.html.
       */

      setTimeout(() => {

        window.location.href =
          "./index.html";

      }, 650);

    }
  );
}