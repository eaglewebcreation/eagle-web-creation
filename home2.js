/* Eagle Web Creation: home page motion (v2).
   Signature: the "How it works" browser builds itself as you scroll (wireframe -> fonts -> color ->
   photo -> live -> found in search -> ongoing care), and a corner meter tracks the build down the page.
   Everything is readable without this file. Reduced-motion visitors get the finished, static version. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Scroll-in reveals */
  var revealTargets = $$("[data-reveal]").concat($$("#landing"));
  if (reduce || !("IntersectionObserver" in window)) {
    revealTargets.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* Header turns solid after the hero starts scrolling */
  var header = $(".site-header");

  /* Rotating business type */
  var slot = $("#rotator-word");
  var words = ["local business", "detail shop", "hardware store", "pizza place", "salon", "construction company", "repair shop"];
  if (slot && !reduce) {
    var wi = 0;
    setInterval(function () {
      if (document.hidden) return;
      wi = (wi + 1) % words.length;
      var next = document.createElement("span");
      next.textContent = words[wi];
      var old = slot.firstElementChild;
      if (old) old.classList.add("is-out");
      setTimeout(function () { slot.innerHTML = ""; slot.appendChild(next); }, 260);
    }, 2400);
  }

  /* "Sound familiar?" broken -> fixed. Tap to toggle; each one fixes itself once it's been on screen a moment. */
  $$(".pain").forEach(function (pain) {
    var btn = $(".pain-screen", pain);
    function set(on) {
      pain.classList.toggle("is-fixed", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }
    btn.addEventListener("click", function () { pain.dataset.touched = "1"; set(!pain.classList.contains("is-fixed")); });
    if (reduce || !("IntersectionObserver" in window)) { set(true); return; }
    var po = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        po.disconnect();
        setTimeout(function () { if (!pain.dataset.touched) set(true); }, 1600 + Array.prototype.indexOf.call(pain.parentNode.children, pain) * 350);
      });
    }, { threshold: 0.6 });
    po.observe(pain);
  });

  /* Price count-up */
  $$(".count").forEach(function (el) {
    var to = parseInt(el.dataset.to, 10);
    if (reduce || !("IntersectionObserver" in window)) return;
    el.textContent = "0";
    var co = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      co.disconnect();
      var t0 = performance.now(), dur = 1100;
      (function tick(t) {
        var k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.6 });
    co.observe(el);
  });

  /* Work screenshots tilt toward the mouse */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$("[data-tilt]").forEach(function (el) {
      el.addEventListener("mousemove", function (ev) {
        var r = el.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--ry", (x * 8).toFixed(2) + "deg");
        el.style.setProperty("--rx", (-y * 6).toFixed(2) + "deg");
      });
      el.addEventListener("mouseleave", function () { el.style.setProperty("--ry", "0deg"); el.style.setProperty("--rx", "0deg"); });
    });
  }

  /* Features: pick one to see it on the phone; cycles on its own until someone taps */
  var feats = $$(".feature"), screen = $("#dp-screen"), fIdx = 0, fTimer = null;
  function showFeat(n) {
    fIdx = n;
    feats.forEach(function (b, i) { b.classList.toggle("is-on", i === n); b.setAttribute("aria-pressed", i === n ? "true" : "false"); });
    if (screen) screen.setAttribute("data-show", n);
  }
  feats.forEach(function (b, i) {
    b.addEventListener("click", function () { clearInterval(fTimer); fTimer = null; showFeat(i); });
  });
  if (!reduce && screen && "IntersectionObserver" in window) {
    var fo = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!fTimer && !screen.dataset.stopped) fTimer = setInterval(function () { showFeat((fIdx + 1) % feats.length); }, 2800);
      } else if (fTimer) { clearInterval(fTimer); fTimer = null; }
    }, { threshold: 0.4 });
    fo.observe(screen);
    feats.forEach(function (b) { b.addEventListener("click", function () { screen.dataset.stopped = "1"; }); });
  }

  /* ===== Signature: the self-building browser ===== */
  var build = $("#build"), bw = $("#bw"), flow = $("#flow"), eagle = $("#build-eagle");
  var steps = flow ? $$(".flow-step", flow) : [];
  var urlEl = $("#bw-url"), qEl = $("#bw-q"), fill = $("#build-fill"), label = $("#build-label"), meterBox = $(".build-meter");
  var STAGES = [
    { at: 0.06, cls: "s-type", label: "Fonts in" },
    { at: 0.14, cls: "s-color", label: "Your colors" },
    { at: 0.22, cls: "s-photo", label: "Your photos" },
    { at: 0.36, cls: "s-live", label: "Live" },
    { at: 0.56, cls: "s-found", label: "Found in search" },
    { at: 0.78, cls: "s-care", label: "Kept current" }
  ];
  var STEP_AT = [0, 0.3, 0.5, 0.74];
  var URL_TEXT = "yourbusiness.com", QUERY = "open now near me";
  var lastStep = -1, lastStage = -1;

  function typeInto(el, text, done) {
    if (!el) return;
    if (el._typing) clearInterval(el._typing);
    var i = 0; el.textContent = "";
    el._typing = setInterval(function () {
      i++; el.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(el._typing); el._typing = null; if (done) done(); }
    }, 55);
  }
  function swoop() {
    if (!eagle || reduce) return;
    eagle.classList.remove("swoop"); void eagle.offsetWidth; eagle.classList.add("swoop");
  }

  function applyBuild(p) {
    var stageIdx = -1;
    STAGES.forEach(function (s, i) {
      var on = p >= s.at;
      bw.classList.toggle(s.cls, on);
      if (on) stageIdx = i;
    });
    if (stageIdx !== lastStage) {
      var goingUp = stageIdx > lastStage;
      if (goingUp && stageIdx >= 0 && lastStage !== -2) swoop();
      // URL bar: private preview until launch
      var live = bw.classList.contains("s-live");
      if (live && (lastStage < 3)) typeInto(urlEl, URL_TEXT);
      if (!live && urlEl) { if (urlEl._typing) clearInterval(urlEl._typing); urlEl.textContent = "private-preview"; }
      var found = bw.classList.contains("s-found");
      if (found && lastStage < 4) typeInto(qEl, QUERY);
      if (!found && qEl) { if (qEl._typing) clearInterval(qEl._typing); qEl.textContent = ""; }
      label.textContent = stageIdx < 0 ? "Wireframe" : STAGES[stageIdx].label;
      meterBox.classList.toggle("is-live", live);
      lastStage = stageIdx;
    }
    var stepIdx = 0;
    STEP_AT.forEach(function (a, i) { if (p >= a) stepIdx = i; });
    if (stepIdx !== lastStep) {
      steps.forEach(function (s, i) {
        s.classList.toggle("is-active", i === stepIdx);
        s.classList.toggle("is-done", i < stepIdx);
      });
      lastStep = stepIdx;
    }
    flow.style.setProperty("--progress", Math.min(1, p / 0.9).toFixed(3));
    fill.style.width = (Math.min(1, p / 0.9) * 100).toFixed(1) + "%";
  }

  /* Corner meter: how built the visitor's site is, by page scroll */
  var meter = $("#meter"), meterPct = $("#meter-pct"), meterLabel = $("#meter-label");

  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset, vh = window.innerHeight;
    if (header) header.classList.toggle("is-solid", y > 40);

    if (build && bw && !reduce) {
      var r = build.getBoundingClientRect();
      var total = r.height - vh;
      var p = total > 0 ? Math.max(0, Math.min(1, -r.top / total)) : 1;
      applyBuild(p);
    }

    if (meter && !reduce) {
      var docH = document.documentElement.scrollHeight - vh;
      var pct = docH > 0 ? Math.min(100, Math.round((y / docH) * 100)) : 100;
      meter.classList.toggle("is-on", y > vh * 0.6);
      if (build) { var br = build.getBoundingClientRect(); meter.classList.toggle("in-build", br.top < vh * 0.5 && br.bottom > vh * 0.5); }
      var live = pct >= 97;
      meter.classList.toggle("is-live", live);
      meterPct.textContent = live ? "Live" : pct + "%";
      meterLabel.textContent = live ? "yourbusiness.com" : "Building yourbusiness.com";
    }
  }
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }

  if (reduce) {
    if (bw) {
      STAGES.forEach(function (s) { bw.classList.add(s.cls); });
      if (urlEl) urlEl.textContent = URL_TEXT;
      if (qEl) qEl.textContent = QUERY;
      label.textContent = "Live"; fill.style.width = "100%"; meterBox.classList.add("is-live");
      steps.forEach(function (s) { s.classList.add("is-active"); });
    }
    window.addEventListener("scroll", function () { if (header) header.classList.toggle("is-solid", window.scrollY > 40); }, { passive: true });
  } else {
    lastStage = -2; // first paint: no swoop
    onScroll();
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
  }
  if (header) header.classList.toggle("is-solid", (window.scrollY || 0) > 40);

  /* ===== Hero -> How it works: the unbuilt browser flies into the build ===== */
  var mini = $(".mini-browser"), stamp = $(".mb-stamp"), cue = $(".scroll-cue");
  var flyFrom = null, flyTo = null, flyEnd = 1, flyTilt = 1;
  var phone = window.matchMedia("(max-width: 900px)");
  function smooth(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function layoutFly() {
    if (reduce || !mini || !bw || !build) return;
    var y = window.scrollY || window.pageYOffset;
    mini.style.transform = "none"; mini.style.opacity = ""; mini.style.clipPath = "";
    var a = mini.getBoundingClientRect(), b2 = bw.getBoundingClientRect(), bt = build.getBoundingClientRect().top + y;
    // page position from layout offsets: unaffected by the hero's fade-up slide, so the landing is exact
    var ox = 0, oy = 0, el = mini;
    while (el) { ox += el.offsetLeft; oy += el.offsetTop; el = el.offsetParent; }
    // where the build browser sits once its section pins (its section's top at the top of the screen)
    var pinOffset = Math.max(0, y - bt); // already past the pin: undo the sticky shift
    flyFrom = { x: ox, y: oy, w: a.width, h: a.height };
    flyTo = { x: b2.left, y: b2.top + y - pinOffset, w: b2.width, h: b2.height };
    flyEnd = Math.max(1, bt);
    flyTilt = phone.matches ? 0 : 1;
    mini.classList.add("is-flying");
    paintFly();
  }
  function paintFly() {
    if (!flyFrom) return;
    var y = window.scrollY || window.pageYOffset;
    var p = Math.max(0, Math.min(1, y / flyEnd)), e = smooth(p);
    var dx = (flyTo.x - flyFrom.x) * e, dy = (flyTo.y - flyFrom.y) * e;
    var s = 1 + (flyTo.w / flyFrom.w - 1) * e;
    var rot = flyTilt * (1 - smooth(p * 2.2)); // phones fly flat, like the hero shows it
    // trim the (taller) hero browser down to the build browser's height as it lands, cropping rather than squashing
    var crop = Math.max(0, (flyFrom.h * s - flyTo.h) / s) * smooth((p - 0.4) / 0.6);
    mini.style.clipPath = crop > 0.5 ? "inset(0 0 " + crop.toFixed(1) + "px 0 round 12px)" : "";
    mini.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px) scale(" + s.toFixed(4) + ")" +
      " perspective(1400px) rotateY(" + (-9 * rot).toFixed(2) + "deg) rotateX(" + (4 * rot).toFixed(2) + "deg)";
    var hand = smooth((p - 0.86) / 0.14);          // last stretch: cross-fade to the real build browser
    mini.style.opacity = (1 - hand).toFixed(3);
    mini.style.visibility = p >= 1 ? "hidden" : "visible";
    bw.style.opacity = p < 0.86 ? "0" : hand.toFixed(3);
    if (stamp) stamp.style.opacity = (1 - smooth(p * 5)).toFixed(3);
    if (cue) cue.style.opacity = (1 - smooth(p * 4)).toFixed(3);
  }
  if (mini && !reduce) {
    var demo = $(".hero-demo");
    if (demo) demo.classList.add("is-in"); // show it right away: it shouldn't still be sliding in while it flies
    mini.style.transformOrigin = "0 0";
    layoutFly();
    window.addEventListener("load", layoutFly);
    setTimeout(layoutFly, 1000); // after the hero has finished fading up into place
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutFly);
    var flyTick = false;
    window.addEventListener("scroll", function () {
      if (flyTick) return; flyTick = true;
      requestAnimationFrame(function () { flyTick = false; paintFly(); });
    }, { passive: true });
  }

  /* ===== Flow: the build line and the seam slashes =====
     The line runs from under the hero to "yourbusiness.com is live" in the footer and fills as you
     scroll; each section label lights up as the line reaches it. Each seam's slash draws itself
     across as that seam comes up the screen. */
  var thread = $("#thread"), hero = $(".hero"), landingLive = $(".landing-live");
  var stops = $$(".section .label.mono, .build .label.mono");
  var seams = $$("main > section:not(.hero)").concat($$(".site-footer"));
  var tTop = 0, tLen = 0;
  function layoutThread() {
    if (!thread || !hero || !landingLive) return;
    var y = window.scrollY || window.pageYOffset;
    var wrap = $(".section .wrap") || $(".wrap");
    var wl = wrap.getBoundingClientRect().left;
    var gap = Math.max(9, Math.min(44, wl - 12));
    document.documentElement.style.setProperty("--thread-gap", gap + "px");
    var hr = hero.getBoundingClientRect(), lr = landingLive.getBoundingClientRect();
    tTop = hr.bottom + y - 60;
    tLen = Math.max(0, lr.top + y + lr.height / 2 - tTop);
    thread.style.left = (wl - gap - 1) + "px";
    thread.style.top = tTop + "px";
    thread.style.height = tLen + "px";
    thread.style.setProperty("--len", tLen + "px");
    paintFlow();
  }
  function paintFlow() {
    var y = window.scrollY || window.pageYOffset, vh = window.innerHeight, mark = y + vh * 0.55;
    if (thread && tLen) {
      var f = reduce ? 1 : Math.max(0, Math.min(1, (mark - tTop) / tLen));
      thread.style.setProperty("--fill", f.toFixed(4));
      thread.style.setProperty("--head", f > 0.001 && f < 0.999 ? 1 : 0);
    }
    stops.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.height) s.classList.toggle("is-lit", reduce || r.top + y <= mark);
    });
    seams.forEach(function (s) {
      var top = s.getBoundingClientRect().top;
      var d = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.95 - top) / (vh * 0.45)));
      s.style.setProperty("--draw", d.toFixed(3));
    });
  }
  layoutThread();
  window.addEventListener("load", layoutThread);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutThread);
  var flowTick = false;
  window.addEventListener("scroll", function () {
    if (flowTick) return; flowTick = true;
    requestAnimationFrame(function () { flowTick = false; paintFlow(); });
  }, { passive: true });

  /* Re-measure on real size changes only (rotation, window resize), not when a phone's address bar
     slides in or out while scrolling. */
  var lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    if (mini && !reduce) layoutFly();
    layoutThread();
  });

  /* Free website check: hands the URL to the contact form. Nothing is "scanned" here. */
  var check = $("#check-form");
  if (check) {
    check.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var url = $("#check-url").value.trim();
      var form = $("#contact-form");
      if (!form) return;
      if (url) form.elements["website"].value = url;
      if (!form.elements["message"].value) form.elements["message"].value = "I'd like the free website check: the 3 biggest things holding my site back.";
      $("#contact").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      setTimeout(function () { form.elements["name"].focus({ preventScroll: true }); }, reduce ? 0 : 700);
    });
  }
})();
