(function () {
  "use strict";

  var section = document.getElementById("reel-creations");
  if (!section) return;

  var tiles = Array.prototype.slice.call(
    section.querySelectorAll(".reel-tile")
  );
  if (!tiles.length) return;

  // The row scrolls horizontally on its own — .reels-grid is a native
  // overflow-x:auto element, so trackpad swipes and shift+wheel already
  // move it left/right for free, while plain vertical scrolling (which
  // it never captures) keeps scrolling the page normally. No JS needed
  // for either.

  var videos = tiles
    .map(function (tile) {
      return tile.querySelector(".reel-video");
    })
    .filter(Boolean);

  /* ---------------------------------------------------------------- */
  /* Every reel autoplays muted on its own (see the <video>'s autoPlay      */
  /* attribute in page.tsx). Hovering one pauses every other reel and         */
  /* unmutes just that one, so exactly one ever plays with sound at a           */
  /* time; leaving it re-mutes it and resumes the rest from where they          */
  /* paused. Touch devices have no hover to trigger this, so reels there         */
  /* just keep playing muted, same as everywhere else on the site that's          */
  /* hover-driven (see script.js's setupHoverDimming).                              */
  /* ---------------------------------------------------------------- */

  var canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  if (!canHover) return;

  tiles.forEach(function (tile) {
    var video = tile.querySelector(".reel-video");
    if (!video) return;

    tile.addEventListener("mouseenter", function () {
      videos.forEach(function (v) {
        if (v !== video) v.pause();
      });
      video.muted = false;
      video.play().catch(function () {
        // Some browsers still block unmuted playback even from a hover
        // gesture — fall back to a silent preview rather than nothing.
        video.muted = true;
        video.play().catch(function () {});
      });
    });

    tile.addEventListener("mouseleave", function () {
      video.muted = true;
      videos.forEach(function (v) {
        if (v !== video) v.play().catch(function () {});
      });
    });
  });
})();
