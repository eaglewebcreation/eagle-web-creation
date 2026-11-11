/* Home page motion: scroll-in fades, rotating word, "Sound familiar" cards, "Recent work" mockups, "How it works" progress line.
   Everything is readable without this file; reduced-motion users get the static version. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Scroll-in fades */
  var items = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Rotating business type in the hero */
  var slot = document.getElementById("rotator-word");
  var words = ["local business", "detail shop", "hardware store", "pizza place", "salon", "construction company", "repair shop"];
  if (slot && !reduce) {
    var i = 0;
    setInterval(function () {
      if (document.hidden) return;
      i = (i + 1) % words.length;
      var next = document.createElement("span");
      next.textContent = words[i];
      var old = slot.firstElementChild;
      if (old) old.classList.add("is-out");
      setTimeout(function () {
        slot.innerHTML = "";
        slot.appendChild(next);
      }, 260);
    }, 2400);
  }

  /* "Sound familiar?" cards: open on wide screens with a mouse, tap to open on phones */
  var pains = document.querySelectorAll(".pain");
  var wide = window.matchMedia("(min-width: 760px) and (hover: hover)");
  function setPains() {
    document.documentElement.classList.toggle("pains-open", wide.matches);
    pains.forEach(function (d) { d.open = wide.matches; });
  }
  setPains();
  if (wide.addEventListener) wide.addEventListener("change", setPains);
  pains.forEach(function (d) {
    d.querySelector("summary").addEventListener("click", function (ev) {
      if (wide.matches) ev.preventDefault();
    });
  });

  /* "How it works" progress line */
  var flow = document.getElementById("flow");
  if (flow) {
    var steps = flow.querySelectorAll(".flow-step");
    var ticking = false;
    function update() {
      ticking = false;
      var p = 1;
      if (!reduce) {
        var r = flow.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var span = Math.max(r.height, vh * 0.35);
        p = (vh * 0.8 - r.top) / span;
        p = Math.max(0, Math.min(1, p));
      }
      flow.style.setProperty("--progress", p.toFixed(3));
      steps.forEach(function (s, n) {
        s.classList.toggle("is-active", p >= n / (steps.length - 1) - 0.02);
      });
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    update();
    if (!reduce) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }
  }
  /* "Recent work": the real pages scroll inside the mockups while they're on screen,
     and the devices tilt a little toward the cursor on computers */
  var stages = document.querySelectorAll(".device-stage");
  if (stages.length && !reduce) {
    if ("IntersectionObserver" in window) {
      var live = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.target.classList.toggle("is-live", e.isIntersecting); });
      }, { threshold: 0.25 });
      stages.forEach(function (st) { live.observe(st); });
    } else {
      stages.forEach(function (st) { st.classList.add("is-live"); });
    }
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    stages.forEach(function (st) {
      var inner = st.querySelector(".device-inner");
      if (!inner) return;
      var frame = 0;
      st.addEventListener("pointermove", function (ev) {
        if (!fine.matches || frame) return;
        frame = requestAnimationFrame(function () {
          frame = 0;
          var r = st.getBoundingClientRect();
          var x = (ev.clientX - r.left) / r.width - 0.5;
          var y = (ev.clientY - r.top) / r.height - 0.5;
          inner.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
          inner.style.setProperty("--rx", (y * -7).toFixed(2) + "deg");
        });
      });
      st.addEventListener("pointerleave", function () {
        inner.style.setProperty("--ry", "0deg");
        inner.style.setProperty("--rx", "0deg");
      });
    });
  }
})();
