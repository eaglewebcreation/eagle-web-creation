/* Eagle Web Creation: work cards play a short silent loop of each site's animations.
   The screenshot stays underneath as the still image. A clip only downloads when its card is about
   to scroll on screen, plays while the card is visible and pauses otherwise. Visitors who prefer
   reduced motion or have data saver on never load the clips and just see the screenshot. */
(function () {
  var vids = Array.prototype.slice.call(document.querySelectorAll("video.work-video"));
  if (!vids.length || !("IntersectionObserver" in window)) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  if (reduce || saveData) return;

  function load(v) {
    if (v.dataset.loaded) return;
    Array.prototype.forEach.call(v.querySelectorAll("source[data-src]"), function (s) { s.src = s.dataset.src; });
    v.dataset.loaded = "1";
    v.load();
  }
  function play(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked: the screenshot stays */ });
  }

  var near = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { load(e.target); near.unobserve(e.target); } });
  }, { rootMargin: "400px 0px" });

  var visible = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      v._onScreen = e.isIntersecting && e.intersectionRatio >= 0.35;
      if (v._onScreen && !document.hidden) { load(v); play(v); } else { v.pause(); }
    });
  }, { threshold: [0, 0.35] });

  vids.forEach(function (v) {
    v.muted = true; // required for autoplay on phones
    v.addEventListener("playing", function () { v.classList.add("is-playing"); });
    near.observe(v);
    visible.observe(v);
  });

  document.addEventListener("visibilitychange", function () {
    vids.forEach(function (v) { if (document.hidden) v.pause(); else if (v._onScreen) play(v); });
  });
})();
