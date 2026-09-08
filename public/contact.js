(function () {
  "use strict";

  /* ==========================================================================
     Contact section — animates the fixed corner "K" brand-mark (hero.css)
     over to the horizontal center once the Contact section (the final
     page) has fully taken over the screen — its top has scrolled up past
     the viewport's own top edge, not just partway into view — via the
     .brand-mark.at-contact modifier. Re-evaluated on every scroll/resize
     tick rather than a one-shot enter event — same pattern as sidenav.js's
     section gating — so scrolling back up smoothly returns the mark to its
     usual corner, mid-gesture.
     ========================================================================== */

  var section = document.getElementById("contact");
  var brandMark = document.querySelector(".brand-mark");
  if (!section || !brandMark) return;

  function evaluate() {
    var rect = section.getBoundingClientRect();
    var atContact = rect.top <= 0;
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
