(function () {
  "use strict";

  var section = document.getElementById("graphic-designs");
  if (!section) return;

  var stage = section.querySelector(".graphics-stage");
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
  }

  layout();

  /* A horizontal scroll gesture (shift+wheel, trackpad swipe) steps
     through the cards, one per gesture. Plain vertical scrolling is
     never touched here — deltaY-dominant events fall straight through
     to the page, so scrolling up/down always just scrolls the page,
     never gets hijacked into stepping the carousel. */
  section.addEventListener(
    "wheel",
    function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

      var dir = e.deltaX > 0 ? 1 : -1;
      var next = index + dir;
      if (next < 0 || next >= cards.length) return; // nothing further that way

      e.preventDefault();

      var now = Date.now();
      if (now - lastStep < STEP_MS) return;
      lastStep = now;

      index = next;
      layout();
    },
    { passive: false }
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
