(function () {
  "use strict";

  var section = document.getElementById("graphic-designs");
  if (!section) return;

  var stage = section.querySelector(".graphics-stage");
  var title = section.querySelector(".graphics-title");
  var cards = stage
    ? Array.prototype.slice.call(stage.querySelectorAll(".gcard"))
    : [];
  if (!cards.length) return;

  var index = 0;
  var MAX_VISIBLE_OFFSET = 3;
  var STEP_MS = 500;
  var lastStep = 0;

  var reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* Every card's transform is expressed in percentages of its OWN box
     (how CSS `translateX`/`rotate` on a `transform` work), so this needs
     no knowledge of the card's actual rendered pixel size — it holds up
     across the responsive width in graphics.css without a resize handler. */
  function layout() {
    cards.forEach(function (card, i) {
      var offset = i - index;
      var abs = Math.abs(offset);
      var sign = offset === 0 ? 0 : offset > 0 ? 1 : -1;
      var clamped = Math.min(abs, MAX_VISIBLE_OFFSET);

      var translateX = sign * clamped * 62; // % of card width per step
      var rotate = sign * clamped * 7; // deg
      var scale = 1 - clamped * 0.1;
      var visible = abs <= MAX_VISIBLE_OFFSET;
      var opacity = visible ? 1 - clamped * 0.26 : 0;

      card.style.transform =
        "translate(-50%, -50%) translateX(" +
        translateX +
        "%) rotate(" +
        rotate +
        "deg) scale(" +
        scale +
        ")";
      card.style.opacity = String(Math.max(opacity, 0));
      card.style.zIndex = String(100 - clamped);
      card.style.pointerEvents = offset === 0 ? "auto" : "none";
    });

    // The title is only meant to be seen at the deck's original,
    // untouched position — once the user has stepped away from the
    // first card, hide it; stepping back to index 0 brings it back.
    if (title) title.classList.toggle("graphics-title--hidden", index !== 0);
  }

  layout();

  /* Shared by both the wheel and touch handlers below: bounds-checks,
     throttles to one step per gesture, and re-renders. Returns whether it
     actually stepped, so each caller only preventDefault()s a gesture it's
     committed to consuming. */
  function step(dir) {
    var next = index + dir;
    if (next < 0 || next >= cards.length) return false; // nothing further that way

    var now = Date.now();
    if (now - lastStep < STEP_MS) return false;
    lastStep = now;

    index = next;
    layout();
    return true;
  }

  /* A horizontal scroll gesture (shift+wheel, trackpad swipe) steps
     through the cards, one per gesture. Plain vertical scrolling is
     never touched here — deltaY-dominant events fall straight through
     to the page, so scrolling up/down always just scrolls the page,
     never gets hijacked into stepping the carousel. */
  section.addEventListener(
    "wheel",
    function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (step(e.deltaX > 0 ? 1 : -1)) e.preventDefault();
    },
    { passive: false }
  );

  /* Touch equivalent — wheel/trackpad gestures don't exist on phones, so
     without this the deck would be permanently stuck on the first card
     there. Same "one step per gesture" feel: a horizontal drag past
     SWIPE_PX steps once and the rest of that same touch is ignored, no
     multi-card flinging. A mostly-vertical drag is left completely alone
     (no preventDefault at all) so the page scrolls normally — mirrors the
     wheel handler's deltaX-vs-deltaY check, just decided once the drag
     has moved far enough to tell direction instead of per-tick. */
  var SWIPE_PX = 40;
  var touchStartX = null;
  var touchStartY = null;
  var touchDecided = false;

  section.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchDecided = false;
    },
    { passive: true }
  );

  section.addEventListener(
    "touchmove",
    function (e) {
      if (touchStartX === null || touchDecided) return;
      var dx = e.touches[0].clientX - touchStartX;
      var dy = e.touches[0].clientY - touchStartY;
      if (Math.abs(dx) < SWIPE_PX && Math.abs(dy) < SWIPE_PX) return;

      touchDecided = true;
      if (Math.abs(dx) <= Math.abs(dy)) return; // vertical drag — let the page scroll

      if (step(dx < 0 ? 1 : -1)) e.preventDefault();
    },
    { passive: false }
  );

  section.addEventListener(
    "touchend",
    function () {
      touchStartX = null;
      touchStartY = null;
    },
    { passive: true }
  );

  /* Reveal on scroll into view, matching the about/showcase pattern. */
  function reveal() {
    section.classList.add("revealed");
  }

  if (reducedMotion || !("IntersectionObserver" in window)) {
    reveal();
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal();
            io.unobserve(section);
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(section);
  }
})();
