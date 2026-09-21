(function () {
  "use strict";

  /* ==========================================================================
     Contact section — animates the fixed corner "K" brand-mark (hero.css)
     over to the horizontal center (same vertical position — see
     .brand-mark.at-contact in hero.css, which only touches left/transform)
     once the Contact section (the final page) covers enough of the
     screen, via the .brand-mark.at-contact modifier.

     Two different thresholds, not one, deliberately — scrolling down,
     center it fairly eagerly once the section is just past half the
     screen (> 60% coverage); scrolling back up, snap it back quickly,
     before coverage has dropped far from full (< 90%). Re-evaluated
     against current coverage each tick (not "was the last tick's ratio
     higher or lower") — same pattern as sidenav.js's section gating — so
     it's a real hysteresis band: once centered, coverage has to fall
     below 90% to revert; once reverted, it has to climb back past 60% to
     re-center. That gap is what stops it flickering back and forth
     around a single threshold.
     ========================================================================== */

  var section = document.getElementById("contact");
  var brandMark = document.querySelector(".brand-mark");
  if (!section || !brandMark) return;

  var ENTER_RATIO = 0.6;
  var EXIT_RATIO = 0.9;
  var atContact = false;

  function evaluate() {
    var rect = section.getBoundingClientRect();
    var visible =
      Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    var ratio = Math.max(0, visible) / window.innerHeight;

    if (!atContact && ratio > ENTER_RATIO) {
      atContact = true;
    } else if (atContact && ratio < EXIT_RATIO) {
      atContact = false;
    }
    brandMark.classList.toggle("at-contact", atContact);
  }

  var ticking = false;
  function queue() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      evaluate();
    });
  }

  evaluate();
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
})();
