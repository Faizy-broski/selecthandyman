/*
  Select Handyman — main.js
  Vanilla JS. GSAP + ScrollTrigger drives scroll animation, Vanilla-Tilt adds
  card tilt, Anime.js draws the hero accent line. All optional layers degrade
  gracefully if a CDN script fails to load, and everything respects
  prefers-reduced-motion.
*/
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Theme toggle (persisted)
  --------------------------------------------------------------------- */
  (function themeToggle() {
    var root = document.documentElement;
    var btn = document.getElementById("theme-toggle");
    var stored = null;
    try { stored = localStorage.getItem("sh-theme"); } catch (e) {}

    if (stored === "dark" || stored === "light") {
      root.setAttribute("data-theme", stored);
    }

    function isDark() {
      if (root.getAttribute("data-theme")) return root.getAttribute("data-theme") === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    btn.setAttribute("aria-pressed", String(isDark()));

    btn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      btn.setAttribute("aria-pressed", String(next === "dark"));
      try { localStorage.setItem("sh-theme", next); } catch (e) {}
    });
  })();

  /* ---------------------------------------------------------------------
     Header scroll state + mobile nav
  --------------------------------------------------------------------- */
  (function header() {
    var header = document.getElementById("site-header");
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("main-nav");
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });

    /* active-link highlight */
    var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
    var sections = links
      .map(function (l) { return document.querySelector(l.getAttribute("href")); })
      .filter(Boolean);
    if ("IntersectionObserver" in window && sections.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var link = links[sections.indexOf(entry.target)];
            if (!link) return;
            if (entry.isIntersecting) {
              links.forEach(function (l) { l.classList.remove("is-active"); });
              link.classList.add("is-active");
            }
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      sections.forEach(function (s) { io.observe(s); });
    }
  })();

  /* ---------------------------------------------------------------------
     Hero: split-word entrance + accent line-draw + photo Ken Burns
  --------------------------------------------------------------------- */
  var gsapReady = typeof window.gsap !== "undefined";
  if (gsapReady) {
    gsap.registerPlugin(ScrollTrigger);
  }

  (function heroEntrance() {
    var words = document.querySelectorAll(".hero-title .word");
    var reveals = document.querySelectorAll(".hero-reveal");
    var media = document.querySelector(".hero-media img");

    if (!gsapReady || reduceMotion) return;

    gsap.set(words, { yPercent: 130, opacity: 0 });
    gsap.set(reveals, { y: 18, opacity: 0 });
    /* Resting scale is 1.2, not 1 — matches the permanent recenter-crop
       zoom set in CSS (.hero-media img), which anchors on the subject via
       transform-origin to crop out the empty wall on the source photo's
       left side. Animating down to 1 here would undo that crop and pop
       the framing back to the original off-centre composition. */
    if (media) gsap.set(media, { scale: 1.1 });

    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(words, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.045 })
      .to(reveals, { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 }, "-=0.5");
    if (media) {
      tl.to(media, { scale: 1.02, duration: 1.8, ease: "power2.out" }, 0.1);
    }
  })();

  (function accentLineDraw() {
    var path = document.getElementById("accent-path");
    if (!path || reduceMotion || typeof window.anime === "undefined") return;
    try {
      anime({
        targets: path,
        strokeDashoffset: [anime.setDashoffset, 0],
        duration: 1100,
        delay: 900,
        easing: "easeInOutSine"
      });
    } catch (err) {
      /* Anime.js unavailable/incompatible — the SVG shows as a plain solid
         line via CSS, which is a perfectly fine static fallback. */
    }
  })();

  /* ---------------------------------------------------------------------
     Vanilla-Tilt on service cards (pointer devices only)
  --------------------------------------------------------------------- */
  (function tilt() {
    if (!hasHover || reduceMotion) return;
    if (typeof window.VanillaTilt === "undefined") return;
    var cards = document.querySelectorAll("[data-tilt]");
    window.VanillaTilt.init(cards);
  })();

  /* ---------------------------------------------------------------------
     Spotlight hover glow on service cards
  --------------------------------------------------------------------- */
  (function spotlight() {
    if (!hasHover) return;
    var cards = document.querySelectorAll(".service-card");
    cards.forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", x + "%");
        card.style.setProperty("--my", y + "%");
      });
    });
  })();

  /* ---------------------------------------------------------------------
     Service Cards Horizontal Scroll Controls
  --------------------------------------------------------------------- */
  (function serviceCarousel() {
    var grid = document.querySelector(".service-grid");
    var prevBtn = document.getElementById("services-prev");
    var nextBtn = document.getElementById("services-next");

    if (!grid || !prevBtn || !nextBtn) return;

    prevBtn.addEventListener("click", function () {
      grid.scrollBy({ left: -400, behavior: "smooth" });
    });

    nextBtn.addEventListener("click", function () {
      grid.scrollBy({ left: 400, behavior: "smooth" });
    });
  })();

  /* ---------------------------------------------------------------------
     Reviews Marquee Pause / Play Control
  --------------------------------------------------------------------- */
  (function reviewsMarquee() {
    var track = document.getElementById("reviews-marquee-track");
    var btn = document.getElementById("marquee-pause-btn");
    if (!track || !btn) return;

    var pauseIcon = btn.querySelector(".pause-icon");
    var playIcon = btn.querySelector(".play-icon");
    var pauseText = btn.querySelector(".pause-text");

    btn.addEventListener("click", function () {
      var isPaused = track.classList.toggle("is-paused");
      if (pauseIcon && playIcon) {
        pauseIcon.style.display = isPaused ? "none" : "inline";
        playIcon.style.display = isPaused ? "inline" : "none";
      }
      if (pauseText) {
        pauseText.textContent = isPaused ? "Resume Autoscroll" : "Pause Autoscroll";
      }
    });
  })();

  /* ---------------------------------------------------------------------
     Mission & Vision Interactive Tab Switcher
  --------------------------------------------------------------------- */
  (function mvTabs() {
    var missionBtn = document.getElementById("tab-mission-btn");
    var visionBtn = document.getElementById("tab-vision-btn");
    var missionPanel = document.getElementById("tab-mission");
    var visionPanel = document.getElementById("tab-vision");

    if (!missionBtn || !visionBtn || !missionPanel || !visionPanel) return;

    function switchTab(activeBtn, inactiveBtn, activePanel, inactivePanel) {
      activeBtn.classList.add("is-active");
      activeBtn.setAttribute("aria-selected", "true");
      inactiveBtn.classList.remove("is-active");
      inactiveBtn.setAttribute("aria-selected", "false");

      inactivePanel.classList.remove("is-active");
      activePanel.classList.add("is-active");
    }

    missionBtn.addEventListener("click", function () {
      switchTab(missionBtn, visionBtn, missionPanel, visionPanel);
    });

    visionBtn.addEventListener("click", function () {
      switchTab(visionBtn, missionBtn, visionPanel, missionPanel);
    });
  })();

  /* ---------------------------------------------------------------------
     Scroll reveals for everything with .reveal-up
  --------------------------------------------------------------------- */
  (function reveals() {
    var items = document.querySelectorAll(".reveal-up");
    if (!items.length) return;

    if (!gsapReady || reduceMotion) {
      items.forEach(function (el) { el.style.opacity = 1; });
      return;
    }

    gsap.set(items, { y: 32, opacity: 0 });

    /* group elements sharing a parent so siblings stagger together
       (Map, not a plain object — object keys would coerce every parent
       element to the same "[object HTMLElement]" string and collapse
       all groups into one) */
    var groups = new Map();
    items.forEach(function (el) {
      var key = el.parentElement;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });

    groups.forEach(function (group) {
      ScrollTrigger.create({
        trigger: group[0],
        start: "top 88%",
        once: true,
        onEnter: function () {
          gsap.to(group, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 });
        }
      });
    });
  })();

  /* ---------------------------------------------------------------------
     Stats count-up
  --------------------------------------------------------------------- */
  (function statCounters() {
    var nums = document.querySelectorAll(".stat-num");
    if (!nums.length) return;

    function animateOne(el) {
      var target = parseFloat(el.getAttribute("data-count-to"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion || !gsapReady) {
        el.textContent = target + suffix;
        return;
      }
      var proxy = { val: 0 };
      gsap.to(proxy, {
        val: target,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: function () {
          el.textContent = Math.round(proxy.val) + suffix;
        }
      });
    }

    if (!("IntersectionObserver" in window)) {
      nums.forEach(animateOne);
      return;
    }

    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateOne(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    nums.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------------------
     Contact form validation + mailto fallback
  --------------------------------------------------------------------- */
  (function contactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var status = document.getElementById("form-status");

    var validators = {
      name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your full name."; },
      email: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address.";
      },
      phone: function (v) {
        if (!v.trim()) return "";
        return /^[0-9+()\-\s]{7,20}$/.test(v.trim()) ? "" : "Please enter a valid phone number.";
      },
      service: function (v) { return v ? "" : "Please choose a service."; },
      message: function (v) { return v.trim().length >= 10 ? "" : "Please add a few details (10+ characters)."; }
    };

    function showError(field, msg) {
      var input = form.elements[field];
      var errorEl = document.getElementById("cf-" + field + "-error");
      if (errorEl) errorEl.textContent = msg;
      if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    }

    function validateField(field) {
      var input = form.elements[field];
      var msg = validators[field](input.value);
      showError(field, msg);
      return !msg;
    }

    ["name", "email", "phone", "service", "message"].forEach(function (field) {
      var input = form.elements[field];
      input.addEventListener("blur", function () { validateField(field); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = ["name", "email", "phone", "service", "message"];
      var valid = fields.map(validateField).every(Boolean);

      if (!valid) {
        status.textContent = "Please fix the highlighted fields.";
        status.className = "form-status is-error";
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        phone: form.elements.phone.value.trim(),
        service: form.elements.service.value,
        message: form.elements.message.value.trim()
      };

      var subject = "Quote request: " + data.service;
      var body =
        "Name: " + data.name + "\n" +
        "Email: " + data.email + "\n" +
        "Phone: " + (data.phone || "-") + "\n" +
        "Service: " + data.service + "\n\n" +
        data.message;

      var mailto =
        "mailto:REPLACE_WITH_BUSINESS_EMAIL@example.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      status.textContent = "Thanks " + data.name.split(" ")[0] + " — opening your email client to send this now.";
      status.className = "form-status is-success";
      window.location.href = mailto;
      form.reset();
    });
  })();
})();
