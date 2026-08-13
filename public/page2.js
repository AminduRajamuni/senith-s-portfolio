(function () {
  "use strict";

  var about = document.getElementById("about");
  if (!about) return;

  function reveal() {
    about.classList.add("revealed");
  }

  if (!("IntersectionObserver" in window)) {
    reveal();
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal();
          io.unobserve(about);
        }
      });
    },
    { threshold: 0.18 }
  );
  io.observe(about);
})();
