(function () {
  "use strict";

  var section = document.getElementById("showcase");
  if (!section) return;

  var frameImg = document.getElementById("showcase-image");
  var frameVideo = document.getElementById("showcase-video");
  var buttons = Array.prototype.slice.call(
    section.querySelectorAll(".model-btn")
  );
  var arrows = Array.prototype.slice.call(
    section.querySelectorAll(".arrow-btn")
  );

  var state = { images: [], index: 0 };

  function readImages(btn) {
    try {
      return JSON.parse(btn.getAttribute("data-images") || "[]");
    } catch (e) {
      return [];
    }
  }

  function setActiveButton(btn) {
    buttons.forEach(function (b) {
      var isActive = b === btn;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  /* One slide, uploaded from /admin/dashboard/3d-works, can be a video
     instead of an image — detected by extension rather than needing a
     separate flag threaded through data-images. */
  function isVideoSrc(src) {
    return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(src);
  }

  function showMedia(src, alt) {
    var currentImgSrc = frameImg ? frameImg.getAttribute("data-current") : null;
    if (!src || src === currentImgSrc) return;

    if (isVideoSrc(src)) {
      if (frameImg) {
        frameImg.classList.remove("fading");
        frameImg.style.display = "none";
        frameImg.setAttribute("data-current", src);
      }
      if (frameVideo) {
        frameVideo.style.display = "block";
        if (frameVideo.getAttribute("src") !== src) {
          frameVideo.src = src;
        }
        frameVideo.play().catch(function () {
          // Autoplay can be blocked before any user gesture — fine, the
          // frame just shows the video's first frame until it is.
        });
      }
      return;
    }

    if (frameVideo && frameVideo.style.display !== "none") {
      frameVideo.pause();
      frameVideo.style.display = "none";
    }
    if (!frameImg) return;
    frameImg.style.display = "block";
    frameImg.setAttribute("data-current", src);
    frameImg.classList.add("fading");
    window.setTimeout(function () {
      frameImg.src = src;
      if (alt) frameImg.alt = alt;
    }, 220);
  }

  if (frameImg) {
    frameImg.addEventListener("load", function () {
      frameImg.classList.remove("fading");
    });
  }

  function selectModel(btn) {
    state.images = readImages(btn);
    state.index = 0;
    setActiveButton(btn);
    if (state.images.length) {
      showMedia(state.images[0], btn.textContent + " render");
    }
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("active")) return;
      selectModel(btn);
    });
  });

  arrows.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!state.images.length) return;
      var dir = parseInt(btn.getAttribute("data-dir"), 10) || 1;
      state.index =
        (state.index + dir + state.images.length) % state.images.length;
      showMedia(state.images[state.index]);
    });
  });

  /* Seed state from whichever button rendered active, without re-fading
     the image that's already showing server-side. */
  var initial =
    buttons.filter(function (b) {
      return b.classList.contains("active");
    })[0] || buttons[0];

  if (initial) {
    state.images = readImages(initial);
    state.index = 0;
    if (frameImg && state.images.length) {
      frameImg.setAttribute("data-current", state.images[0]);
    }
  }

  /* Reveal on scroll into view, matching the about section's pattern. */
  function reveal() {
    section.classList.add("revealed");
  }

  if (!("IntersectionObserver" in window)) {
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
