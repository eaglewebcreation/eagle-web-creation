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
    }, { rootMargin: "0px 0px 15% 0px", threshold: 0 }); // start just before it scrolls on screen
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
    fill.style.transform = "scaleX(" + Math.min(1, p / 0.9).toFixed(3) + ")";
  }

  /* ===== Scroll engine =====
     Everything that moves with the scroll (How it works build, corner meter, hero browser flight, build
     line, seam slashes) runs from ONE pass per frame. Page positions are measured once (on load, when
     fonts arrive and on a real resize) and cached, so a frame only does arithmetic on scrollY and writes
     what changed. Reading positions every frame forced the phone to re-lay-out the whole page several
     times per frame, which is what made it stutter. */
  var meter = $("#meter"), meterPct = $("#meter-pct"), meterLabel = $("#meter-label");
  var mini = $(".mini-browser"), stamp = $(".mb-stamp"), cue = $(".scroll-cue"), demo = $(".hero-demo");
  var thread = $("#thread"), hero = $(".hero"), landingLive = $(".landing-live"), sticky = $(".build-sticky");
  var stops = $$(".section .label.mono, .build .label.mono").map(function (el) { return { el: el, y: 0, on: null }; });
  var seams = $$("main > section:not(.hero)").concat($$(".site-footer")).map(function (el) {
    var slash = document.createElement("span");
    slash.className = "seam-slash"; slash.setAttribute("aria-hidden", "true");
    el.insertBefore(slash, el.firstChild);
    return { el: el, slash: slash, y: 0, d: -1 };
  });
  var phone = window.matchMedia("(max-width: 900px)");
  // The flight runs as a CSS scroll-driven animation where the browser supports it: it then moves on the
  // browser's own scrolling thread and can't lag behind the page. Older browsers use the script below.
  var cssFly = !!(window.CSS && CSS.supports && CSS.supports("animation-timeline: scroll()"));
  var M = {}; // cached measurements
  var sd = cssFly && !reduce; // build line and seam slashes as scroll animations too (see home2.css)
  if (sd) document.documentElement.classList.add("sd");
  var last = { solid: null, p: -1, pct: -1, live: null, on: null, inb: null, fill: -1, head: null, fly: -1 };

  function smooth(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  // page position from layout offsets: ignores fade-in slides and other transforms; anything inside the
  // pinned How it works panel is measured from the top of its section, not from where it happens to be pinned
  function pageTop(el) {
    var y = 0;
    while (el) {
      if (el === sticky) return y + M.buildTop;
      y += el.offsetTop; el = el.offsetParent;
    }
    return y;
  }
  function pageLeft(el) { var x = 0; while (el) { x += el.offsetLeft; el = el.offsetParent; } return x; }

  function measure() {
    var html = document.documentElement;
    M.vh = window.innerHeight;
    M.docH = html.scrollHeight;
    if (build) { M.buildTop = 0; M.buildTop = pageTop(build); M.buildH = build.offsetHeight; }
    stops.forEach(function (s) { s.y = s.el.offsetHeight ? pageTop(s.el) : Infinity; });
    seams.forEach(function (s) { s.y = pageTop(s.el); s.d = -1; });
    // build line
    if (thread && hero && landingLive) {
      var wrap = $(".section .wrap") || $(".wrap");
      var wl = pageLeft(wrap) + parseFloat(getComputedStyle(wrap).paddingLeft || 0);
      var gap = Math.max(9, Math.min(44, wl - 12));
      html.style.setProperty("--thread-gap", gap + "px");
      M.tTop = pageTop(hero) + hero.offsetHeight - 60;
      M.tLen = Math.max(0, pageTop(landingLive) + landingLive.offsetHeight / 2 - M.tTop);
      thread.style.left = (wl - gap - 1) + "px";
      thread.style.top = M.tTop + "px";
      thread.style.height = M.tLen + "px";
      thread.style.setProperty("--len", M.tLen + "px");
      M.tVh = -1; // the line's scroll range depends on the window height; frame() sets it
      last.fill = -1;
    }
    // hero browser flight: from its spot in the hero to the build browser's spot once that section pins
    if (mini && bw && build && !reduce) {
      var fx = pageLeft(mini), fy = pageTop(mini), fw = mini.offsetWidth, fh = mini.offsetHeight;
      var tx = pageLeft(bw), ty = pageTop(bw), tw = bw.offsetWidth, th = bw.offsetHeight;
      var s = tw / fw;
      M.fly = { dx: tx - fx, dy: ty - fy, s: s, crop: Math.max(0, (fh * s - th) / s), end: Math.max(1, M.buildTop), tilt: phone.matches ? 0 : 1 };
      var r = html.style;
      r.setProperty("--fly-dx", M.fly.dx.toFixed(1) + "px");
      r.setProperty("--fly-dy", M.fly.dy.toFixed(1) + "px");
      r.setProperty("--fly-s", M.fly.s.toFixed(4));
      r.setProperty("--fly-crop", M.fly.crop.toFixed(1) + "px");
      r.setProperty("--fly-tilt", M.fly.tilt);
      r.setProperty("--fly-end", M.fly.end.toFixed(0) + "px");
      mini.classList.toggle("fly-crop", M.fly.crop > 0.5);
      last.fly = -1;
    }
    frame();
  }

  function frame() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset, vh = window.innerHeight;

    // scroll speed: above ~1.5 screens a second, reveals skip their fade until scrolling slows down
    var now = performance.now();
    if (M.lastT) {
      var v = Math.abs(y - M.lastY) / Math.max(1, now - M.lastT); // px per ms
      if (v > vh * 0.0015) {
        if (!M.fast) { document.documentElement.classList.add("scroll-fast"); M.fast = true; }
        clearTimeout(M.slowTimer);
        M.slowTimer = setTimeout(function () { document.documentElement.classList.remove("scroll-fast"); M.fast = false; }, 180);
      }
    }
    M.lastY = y; M.lastT = now;

    var solid = y > 40;
    if (header && solid !== last.solid) { header.classList.toggle("is-solid", solid); last.solid = solid; }
    if (reduce) return;

    // How it works build
    if (build && bw) {
      var total = M.buildH - vh;
      var p = total > 0 ? Math.max(0, Math.min(1, (y - M.buildTop) / total)) : 1;
      if (Math.abs(p - last.p) > 0.0005) { applyBuild(p); last.p = p; }
    }

    // corner meter
    if (meter) {
      var docH = M.docH - vh;
      var pct = docH > 0 ? Math.min(100, Math.round((y / docH) * 100)) : 100;
      var on = y > vh * 0.6, inb = build ? (y + vh * 0.5 > M.buildTop && y + vh * 0.5 < M.buildTop + M.buildH) : false;
      if (on !== last.on) { meter.classList.toggle("is-on", on); last.on = on; }
      if (inb !== last.inb) { meter.classList.toggle("in-build", inb); last.inb = inb; }
      if (pct !== last.pct) {
        var live = pct >= 97;
        meterPct.textContent = live ? "Live" : pct + "%";
        if (live !== last.live) {
          meter.classList.toggle("is-live", live);
          meterLabel.textContent = live ? "yourbusiness.com" : "Building yourbusiness.com";
          last.live = live;
        }
        last.pct = pct;
      }
    }

    // hero browser flight (script version, only where the browser can't run it as a scroll animation)
    if (M.fly && !cssFly) {
      var fp = Math.max(0, Math.min(1, y / M.fly.end));
      if (Math.abs(fp - last.fly) > 0.0005) {
        var e = smooth(fp), sc = 1 + (M.fly.s - 1) * e, rot = M.fly.tilt * (1 - smooth(fp * 2.2));
        var crop = M.fly.crop * smooth((fp - 0.4) / 0.6);
        mini.style.clipPath = crop > 0.5 ? "inset(0 0 " + crop.toFixed(1) + "px 0 round 12px)" : "";
        mini.style.transform = "translate3d(" + (M.fly.dx * e).toFixed(1) + "px," + (M.fly.dy * e).toFixed(1) + "px,0) scale(" + sc.toFixed(4) + ")" +
          (rot ? " perspective(1400px) rotateY(" + (-9 * rot).toFixed(2) + "deg) rotateX(" + (4 * rot).toFixed(2) + "deg)" : "");
        var hand = smooth((fp - 0.86) / 0.14);
        mini.style.opacity = (1 - hand).toFixed(3);
        mini.style.visibility = fp >= 1 ? "hidden" : "visible";
        bw.style.opacity = fp < 0.86 ? "0" : hand.toFixed(3);
        if (stamp) stamp.style.opacity = (1 - smooth(fp * 5)).toFixed(3);
        if (cue) cue.style.opacity = (1 - smooth(fp * 4)).toFixed(3);
        last.fly = fp;
      }
    }

    // build line + section stops
    if (sd && thread && M.tLen && vh !== M.tVh) {
      // the line fills as the point 55% down the screen travels from its start to its end
      thread.style.setProperty("--t-start", (M.tTop - vh * 0.55).toFixed(0) + "px");
      thread.style.setProperty("--t-end", (M.tTop + M.tLen - vh * 0.55).toFixed(0) + "px");
      M.tVh = vh;
    }
    if (thread && M.tLen) {
      var mark = y + vh * 0.55;
      var f = Math.max(0, Math.min(1, (mark - M.tTop) / M.tLen));
      if (!sd && Math.abs(f - last.fill) > 0.0003) {
        thread.style.setProperty("--fill", f.toFixed(4));
        var head = f > 0.001 && f < 0.999;
        if (head !== last.head) { thread.style.setProperty("--head", head ? 1 : 0); last.head = head; }
        last.fill = f;
      }
      stops.forEach(function (s) {
        var lit = s.y <= mark;
        if (lit !== s.on) { s.el.classList.toggle("is-lit", lit); s.on = lit; }
      });
    }

    // seam slashes draw in as each seam comes up the screen
    if (!sd) seams.forEach(function (s) {
      var top = s.y - y;
      var d = Math.max(0, Math.min(1, (vh * 0.95 - top) / (vh * 0.45)));
      d = Math.round(d * 100) / 100;
      if (d !== s.d) { s.slash.style.scale = d + " 1"; s.d = d; }
    });
  }

  var ticking = false;
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  if (reduce) {
    if (bw) {
      STAGES.forEach(function (s) { bw.classList.add(s.cls); });
      if (urlEl) urlEl.textContent = URL_TEXT;
      if (qEl) qEl.textContent = QUERY;
      label.textContent = "Live"; fill.style.transform = "scaleX(1)"; meterBox.classList.add("is-live");
      steps.forEach(function (s) { s.classList.add("is-active"); });
    }
    if (thread) thread.style.setProperty("--fill", 1);
    stops.forEach(function (s) { s.el.classList.add("is-lit"); });
    seams.forEach(function (s) { s.slash.style.scale = "1 1"; });
  } else {
    lastStage = -2; // first paint: no swoop
    if (demo) demo.classList.add("is-in"); // the hero browser shouldn't still be sliding in while it flies
    if (mini) {
      mini.style.transformOrigin = "0 0";
      mini.classList.add(cssFly ? "fly-css" : "is-flying");
      if (cssFly) {
        bw.classList.add("fly-css-target");
        if (stamp) stamp.classList.add("fly-css-fade");
        if (cue) cue.classList.add("fly-css-fade");
      }
    }
  }
  measure();
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("load", measure);
  setTimeout(measure, 1000); // after the hero has finished fading up into place
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  // re-measure on real size changes only (rotation, window resize), not when a phone's address bar slides
  var lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastW) { requestTick(); return; }
    lastW = window.innerWidth;
    measure();
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
