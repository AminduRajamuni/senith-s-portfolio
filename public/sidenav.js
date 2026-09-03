(function () {
  "use strict";

  var nav = document.getElementById("side-nav");
  if (!nav) return;

  var about = document.getElementById("about");
  var autoShown = false;
  var forceOpen = false;
  var hovering = false;
  var sectionReady = false;

  function sync() {
    nav.classList.toggle("open", sectionReady && (forceOpen || hovering));
  }

  /* ---------------------------------------------------------------- */
  /* Section gate: the nav is only ever eligible to show once #about    */
  /* has fully scrolled out of view — i.e. no pixel of page 2 is on      */
  /* screen and #showcase (which sits directly beneath it, exactly       */
  /* 100svh tall) fully occupies the viewport. Re-evaluated on every     */
  /* scroll/resize tick rather than a one-shot enter/exit event, so       */
  /* scrolling back up hides the panel immediately, mid-gesture.          */
  /* ---------------------------------------------------------------- */

  function evaluateSection() {
    var ready = about ? about.getBoundingClientRect().bottom <= 0 : false;
    if (ready === sectionReady) return;
    sectionReady = ready;

    /* First time the section becomes fully ready, auto-open the panel
       once, then auto-close it 2s later — a one-time intro, not a
       persistent "open whenever visible" state. Only fires going
       forward (scrolling down into it); scrolling back up and down
       again won't repeat it. After that it only opens on hover
       (below). */
    if (sectionReady && !autoShown) {
      autoShown = true;
      forceOpen = true;
      sync();
      window.setTimeout(function () {
        forceOpen = false;
        sync();
      }, 2000);
      return;
    }

    sync();
  }

  if (about) {
    var sectionTicking = false;
    function queueSectionCheck() {
      if (sectionTicking) return;
      sectionTicking = true;
      window.requestAnimationFrame(function () {
        sectionTicking = false;
        evaluateSection();
      });
    }
    evaluateSection();
    window.addEventListener("scroll", queueSectionCheck, { passive: true });
    window.addEventListener("resize", queueSectionCheck);
  }

  /* Manual open: this only triggers right at the true screen edge, not
     across the panel's whole width — otherwise moving the cursor toward
     the showcase's left arrow (which sits well inside that width) would
     pop the panel open on the way there. Once it IS open, though, the
     close boundary relaxes to the panel's own width, so moving over it
     to read/click "3D Works" doesn't slam it shut. This checks cursor
     position rather than hovering an element, so the (mostly
     transparent) panel never has to capture pointer events and steal
     clicks from page content underneath it — see sidenav.css. Actual
     visibility is still gated by sectionReady inside sync(), so this
     tracks hover intent even while off-section without showing anything. */
  var OPEN_ZONE_PX = 28;
  var fineHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (fineHover.matches) {
    var ticking = false;
    var lastX = -1;

    function evaluateHover() {
      ticking = false;
      var threshold = hovering ? nav.offsetWidth : OPEN_ZONE_PX;
      var next = lastX >= 0 && lastX <= threshold;
      if (next !== hovering) {
        hovering = next;
        sync();
      }
    }

    document.addEventListener(
      "mousemove",
      function (e) {
        lastX = e.clientX;
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(evaluateHover);
        }
      },
      { passive: true }
    );

    /* Reset if the cursor leaves the window entirely (e.g. alt-tab, or
       moving into the OS chrome) so the panel doesn't get stuck open. */
    document.documentElement.addEventListener("mouseleave", function () {
      lastX = -1;
      hovering = false;
      sync();
    });
    window.addEventListener("blur", function () {
      lastX = -1;
      hovering = false;
      sync();
    });
  }

  /* The active item scrolls back to its section; the rest have no
     destination yet, so they're rendered as inert labels (see page.tsx). */
  var items = Array.prototype.slice.call(
    nav.querySelectorAll("button.side-nav-item")
  );
  items.forEach(function (btn) {
    var targetId = btn.getAttribute("data-target");
    if (!targetId) return;
    btn.addEventListener("click", function () {
      var target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
