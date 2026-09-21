(function () {
  "use strict";

  var nav = document.getElementById("side-nav");
  if (!nav) return;

  var tab = document.getElementById("side-nav-tab");
  var about = document.getElementById("about");
  var autoShown = false;
  var forceOpen = false;
  var hovering = false;
  var sectionReady = false;

  function sync() {
    nav.classList.toggle("open", sectionReady && (forceOpen || hovering));
    if (tab) {
      tab.classList.toggle("ready", sectionReady);
      tab.setAttribute("aria-expanded", String(hovering));
    }
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
  } else if (tab) {
    /* No fine hover pointer (phone/tablet) — the edge tab (sidenav.css)
       is this device's way in instead: tap to open, tap it again or tap
       anywhere outside the open panel to close. `fineHover.matches` and
       this branch are mutually exclusive (a device's primary pointer is
       either hover-capable or it isn't), so there's no double-handling
       on the rare hybrid device. */
    tab.addEventListener("click", function () {
      hovering = !hovering;
      sync();
    });

    document.addEventListener(
      "touchstart",
      function (e) {
        if (!hovering) return;
        var target = e.target;
        if (nav.contains(target) || tab.contains(target)) return;
        hovering = false;
        sync();
      },
      { passive: true }
    );
  }

  /* Linked items scroll to their section on click; the rest have no
     destination yet, so they're rendered as inert labels (see page.tsx). */
  var items = Array.prototype.slice.call(
    nav.querySelectorAll("button.side-nav-item")
  );
  var linkedItems = [];
  items.forEach(function (btn) {
    var targetId = btn.getAttribute("data-target");
    if (!targetId) return;
    var section = document.getElementById(targetId);
    if (section) linkedItems.push({ btn: btn, section: section });
    btn.addEventListener("click", function () {
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      // On touch, nothing else closes the panel after picking a
      // destination (there's no mouse to move away with) — do it here.
      // A no-op on hover-capable devices: `hovering` there tracks live
      // cursor position, not a state this click should override.
      if (!fineHover.matches && hovering) {
        hovering = false;
        sync();
      }
    });
  });

  /* ---------------------------------------------------------------- */
  /* Active-item highlighting: bold whichever linked item's section        */
  /* currently covers the most of the viewport's height — always one of    */
  /* them, even mid-transition when no single section fills nearly all of   */
  /* it (e.g. scrolling past the boundary between two sections leaves both   */
  /* partially visible). No minimum-coverage threshold: the nav should        */
  /* never sit with nothing highlighted. Re-evaluated on every scroll/resize  */
  /* tick so it swaps the instant one section's lead is taken by the next,    */
  /* in either direction.                                                      */
  /* ---------------------------------------------------------------- */

  if (linkedItems.length) {
    function updateActiveItem() {
      var current = null;
      var bestRatio = -1;
      for (var i = 0; i < linkedItems.length; i++) {
        var rect = linkedItems[i].section.getBoundingClientRect();
        var visible =
          Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        var ratio = visible / window.innerHeight;
        if (ratio > bestRatio) {
          current = linkedItems[i];
          bestRatio = ratio;
        }
      }
      linkedItems.forEach(function (item) {
        var isActive = item === current;
        item.btn.classList.toggle("active", isActive);
        if (isActive) item.btn.setAttribute("aria-current", "page");
        else item.btn.removeAttribute("aria-current");
      });

      // Motion Graphics sits on a light background, and Reel Creations /
      // Graphic Designs sit on busy photo/dark backgrounds — the
      // mint-green text doesn't read well over any of the three, so it
      // switches to white there and back to normal everywhere else.
      var WHITE_TEXT_TARGETS = [
        "motion-graphics",
        "reel-creations",
        "graphic-designs",
      ];
      nav.classList.toggle(
        "on-light",
        !!current &&
          WHITE_TEXT_TARGETS.indexOf(current.btn.getAttribute("data-target")) !== -1
      );
    }

    var activeTicking = false;
    function queueActiveCheck() {
      if (activeTicking) return;
      activeTicking = true;
      window.requestAnimationFrame(function () {
        activeTicking = false;
        updateActiveItem();
      });
    }

    updateActiveItem();
    window.addEventListener("scroll", queueActiveCheck, { passive: true });
    window.addEventListener("resize", queueActiveCheck);
  }
})();
