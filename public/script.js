(function () {
  "use strict";

  var hero = document.getElementById("hero");
  if (!hero) return;

  document.documentElement.classList.remove("no-js");

  var heroBg = hero.querySelector(".hero-bg");
  var objs = Array.prototype.slice.call(hero.querySelectorAll(".obj"));
  var logo = hero.querySelector(".logo");
  var brandMark = document.querySelector(".brand-mark");
  var images = Array.prototype.slice.call(hero.querySelectorAll("img"));
  if (brandMark) {
    images = images.concat(
      Array.prototype.slice.call(brandMark.querySelectorAll("img"))
    );
  }

  /* ---------------------------------------------------------------- */
  /* Brand mark: click/tap scrolls back to the top of the homepage      */
  /* ---------------------------------------------------------------- */

  if (brandMark) {
    var scrollToTop = function () {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    };
    brandMark.addEventListener("click", scrollToTop);
    brandMark.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        scrollToTop();
      }
    });
  }

  /* ---------------------------------------------------------------- */
  /* Brand mark theme: swap to the black logo (crossfading, see          */
  /* hero.css) while the viewport is centered on a light-background       */
  /* page (about, motion graphics) — the white mark disappears there.     */
  /* Checking whichever section contains the viewport's vertical           */
  /* midpoint, rather than a visibility-ratio threshold, means exactly     */
  /* one section is ever "current" with no dead zones to tune.             */
  /* ---------------------------------------------------------------- */

  if (brandMark) {
    var lightSections = ["about", "motion-graphics"]
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);

    if (lightSections.length) {
      var updateBrandMarkTheme = function () {
        var mid = window.innerHeight / 2;
        var onLight = lightSections.some(function (section) {
          var rect = section.getBoundingClientRect();
          return rect.top <= mid && rect.bottom >= mid;
        });
        brandMark.classList.toggle("on-light", onLight);
      };

      var markTicking = false;
      var queueBrandMarkCheck = function () {
        if (markTicking) return;
        markTicking = true;
        window.requestAnimationFrame(function () {
          markTicking = false;
          updateBrandMarkTheme();
        });
      };

      updateBrandMarkTheme();
      window.addEventListener("scroll", queueBrandMarkCheck, {
        passive: true,
      });
      window.addEventListener("resize", queueBrandMarkCheck);
    }
  }

  var STAGGER_MS = 120;
  var OBJECT_DURATION_MS = 1100;
  var LOGO_DELAY_MS = 300;
  var LOGO_DURATION_MS = 800;
  var BG_DURATION_MS = 1600;
  var READY_BUFFER_MS = 80;

  var reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  var canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  /* ---------------------------------------------------------------- */
  /* Preload + decode every image before the sequence starts           */
  /* ---------------------------------------------------------------- */

  function waitForImage(img) {
    return new Promise(function (resolve) {
      function done() {
        resolve();
      }
      if (img.complete && img.naturalWidth > 0) {
        if (img.decode) {
          img.decode().then(done).catch(done);
        } else {
          done();
        }
        return;
      }
      img.addEventListener("load", function () {
        if (img.decode) {
          img.decode().then(done).catch(done);
        } else {
          done();
        }
      });
      img.addEventListener("error", done);
    });
  }

  var bgPreload = new Promise(function (resolve) {
    var probe = new Image();
    probe.onload = resolve;
    probe.onerror = resolve;
    probe.src = "/assets/background.jpg";
  });

  var safetyTimeout = new Promise(function (resolve) {
    setTimeout(resolve, 4000);
  });

  Promise.race([
    Promise.all(images.map(waitForImage).concat([bgPreload])),
    safetyTimeout,
  ]).then(runIntro);

  /* ---------------------------------------------------------------- */
  /* Entrance sequence                                                  */
  /* ---------------------------------------------------------------- */

  function runIntro() {
    if (reducedMotion) {
      heroBg.classList.add("enter");
      if (brandMark) brandMark.classList.add("enter");
      objs.forEach(function (obj) {
        obj.classList.add("enter");
      });
      if (logo) logo.classList.add("enter");
      hero.classList.add("ready");
      return;
    }

    heroBg.classList.add("enter");
    if (brandMark) brandMark.classList.add("enter");

    objs.forEach(function (obj, i) {
      setTimeout(function () {
        obj.classList.add("enter");
      }, i * STAGGER_MS);
    });

    setTimeout(function () {
      if (logo) logo.classList.add("enter");
    }, LOGO_DELAY_MS);

    var objectsFinish = (objs.length - 1) * STAGGER_MS + OBJECT_DURATION_MS;
    var logoFinish = LOGO_DELAY_MS + LOGO_DURATION_MS;
    var totalDuration = Math.max(objectsFinish, logoFinish, BG_DURATION_MS);

    setTimeout(function () {
      hero.classList.add("ready");
      setupHoverDimming();
      setupParallax();
    }, totalDuration + READY_BUFFER_MS);
  }

  /* ---------------------------------------------------------------- */
  /* Hover: dim non-hovered objects, lift hovered one above the rest    */
  /* ---------------------------------------------------------------- */

  function setupHoverDimming() {
    if (!canHover || reducedMotion) return;

    objs.forEach(function (obj) {
      var art = obj.querySelector(".obj-art");
      if (!art) return;

      art.addEventListener("mouseenter", function () {
        hero.classList.add("dimming");
        obj.classList.add("hovered");
      });
      art.addEventListener("mouseleave", function () {
        hero.classList.remove("dimming");
        obj.classList.remove("hovered");
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Parallax: lerped cursor-follow, depth-scaled per object            */
  /* ---------------------------------------------------------------- */

  function setupParallax() {
    if (!canHover || reducedMotion) return;

    var LERP = 0.06;
    var state = objs.map(function (obj) {
      var range = parseFloat(getComputedStyle(obj).getPropertyValue("--parallax")) || 0;
      return { obj: obj, range: range, curX: 0, curY: 0, targetX: 0, targetY: 0 };
    });

    window.addEventListener(
      "mousemove",
      function (e) {
        var nx = e.clientX / window.innerWidth - 0.5;
        var ny = e.clientY / window.innerHeight - 0.5;
        state.forEach(function (s) {
          s.targetX = nx * 2 * s.range;
          s.targetY = ny * 2 * s.range;
        });
      },
      { passive: true }
    );

    function tick() {
      state.forEach(function (s) {
        s.curX += (s.targetX - s.curX) * LERP;
        s.curY += (s.targetY - s.curY) * LERP;
        s.obj.style.transform =
          "translate(" + s.curX.toFixed(2) + "px, " + s.curY.toFixed(2) + "px)";
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
})();
