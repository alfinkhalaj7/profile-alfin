(function () {
    "use strict";
  
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
    /* ---------------------------------------------------------
       1. Build the hero "slats" — vertical bars that recreate
          the red-to-silver gradient blinds from the source image.
    --------------------------------------------------------- */
    var slatsContainer = document.getElementById("slats");
    if (slatsContainer) {
      var TOTAL = 48;
      var frag = document.createDocumentFragment();
  
      for (var i = 0; i < TOTAL; i++) {
        var t = i / (TOTAL - 1); // 0 -> 1 across the hero
        var span = document.createElement("span");
  
        // Base tone travels from deep red (left) through near-black
        // to silver (right), matching the reference palette image.
        var color;
        if (t < 0.45) {
          color = mix("#4a0d1a", "#0a0a0c", t / 0.45);
        } else if (t < 0.55) {
          color = "#0a0a0c";
        } else {
          color = mix("#0a0a0c", "#c7c9cd", (t - 0.55) / 0.45);
        }
  
        var shade = i % 2 === 0 ? 0.94 : 1;
        span.style.background = "linear-gradient(180deg," + color + " 0%, " + shadeColor(color, shade) + " 100%)";
        span.style.opacity = 0.9;
        span.style.borderRight = "1px solid rgba(0,0,0,0.35)";
        frag.appendChild(span);
      }
      slatsContainer.appendChild(frag);
    }
  
    function mix(hexA, hexB, amt) {
      var a = hexToRgb(hexA), b = hexToRgb(hexB);
      var r = Math.round(a.r + (b.r - a.r) * amt);
      var g = Math.round(a.g + (b.g - a.g) * amt);
      var bl = Math.round(a.b + (b.b - a.b) * amt);
      return "rgb(" + r + "," + g + "," + bl + ")";
    }
    function hexToRgb(hex) {
      hex = hex.replace("#", "");
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      };
    }
    function shadeColor(rgbStr, factor) {
      var m = rgbStr.match(/\d+/g).map(Number);
      return "rgb(" + Math.round(m[0] * factor) + "," + Math.round(m[1] * factor) + "," + Math.round(m[2] * factor) + ")";
    }
  
    /* ---------------------------------------------------------
       2. Light sweep follows the cursor across the slats
          (falls back to a slow ambient drift on touch devices
          or when reduced motion is requested).
    --------------------------------------------------------- */
    var hero = document.querySelector(".hero");
    if (hero) {
      if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
        hero.addEventListener("mousemove", function (e) {
          var rect = hero.getBoundingClientRect();
          var pct = ((e.clientX - rect.left) / rect.width) * 100;
          hero.style.setProperty("--mx", pct + "%");
        });
      } else if (!reduceMotion) {
        var pos = 20, dir = 1;
        setInterval(function () {
          pos += dir * 0.4;
          if (pos > 85 || pos < 15) dir *= -1;
          hero.style.setProperty("--mx", pos + "%");
        }, 60);
      }
    }
  
    /* ---------------------------------------------------------
       3b. ID CARD — 3D tilt + glare, mouse (desktop) and touch.
    --------------------------------------------------------- */
    var idcard = document.getElementById("idcard");
    var idcardBody = document.getElementById("idcardBody");
    if (idcard && idcardBody && !reduceMotion) {
      var MAX_TILT = 14;
  
      function tiltFromPoint(clientX, clientY) {
        var rect = idcardBody.getBoundingClientRect();
        var px = (clientX - rect.left) / rect.width;   // 0..1
        var py = (clientY - rect.top) / rect.height;   // 0..1
        var ry = (px - 0.5) * MAX_TILT * 2;             // rotateY
        var rx = (0.5 - py) * MAX_TILT * 2;             // rotateX
        idcardBody.style.setProperty("--rx", rx.toFixed(2) + "deg");
        idcardBody.style.setProperty("--ry", ry.toFixed(2) + "deg");
        idcardBody.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        idcardBody.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      }
  
      function resetTilt() {
        idcardBody.style.setProperty("--rx", "0deg");
        idcardBody.style.setProperty("--ry", "0deg");
        idcard.classList.remove("is-active");
      }
  
      if (window.matchMedia("(hover: hover)").matches) {
        idcard.addEventListener("mouseenter", function () {
          idcard.classList.add("is-active");
          idcard.style.animationPlayState = "paused";
        });
        idcard.addEventListener("mousemove", function (e) {
          tiltFromPoint(e.clientX, e.clientY);
        });
        idcard.addEventListener("mouseleave", function () {
          resetTilt();
          idcard.style.animationPlayState = "running";
        });
      } else {
        // touch devices: follow the finger while pressed
        idcard.addEventListener("touchstart", function () {
          idcard.classList.add("is-active");
          idcard.style.animationPlayState = "paused";
        }, { passive: true });
        idcard.addEventListener("touchmove", function (e) {
          if (e.touches && e.touches[0]) {
            tiltFromPoint(e.touches[0].clientX, e.touches[0].clientY);
          }
        }, { passive: true });
        idcard.addEventListener("touchend", function () {
          resetTilt();
          idcard.style.animationPlayState = "running";
        });
      }
    }
  
    /* ---------------------------------------------------------
       3c. Magnetic hover for primary buttons (desktop only).
    --------------------------------------------------------- */
    if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
      document.querySelectorAll(".btn").forEach(function (btn) {
        btn.addEventListener("mousemove", function (e) {
          var rect = btn.getBoundingClientRect();
          var x = e.clientX - rect.left - rect.width / 2;
          var y = e.clientY - rect.top - rect.height / 2;
          btn.style.transform = "translate(" + (x * 0.22).toFixed(1) + "px," + (y * 0.35).toFixed(1) + "px)";
        });
        btn.addEventListener("mouseleave", function () {
          btn.style.transform = "";
        });
      });
  
      // gentle tilt on project / design cards, echoing the ID card language
      document.querySelectorAll(".project, .design-card").forEach(function (card) {
        card.addEventListener("mousemove", function (e) {
          var rect = card.getBoundingClientRect();
          var px = (e.clientX - rect.left) / rect.width;
          var py = (e.clientY - rect.top) / rect.height;
          var rx = (0.5 - py) * 4;
          var ry = (px - 0.5) * 4;
          card.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-4px)";
        });
        card.addEventListener("mouseleave", function () {
          card.style.transform = "";
        });
      });
    }
  
    /* ---------------------------------------------------------
       3. Scroll-reveal for section content.
    --------------------------------------------------------- */
    var revealTargets = document.querySelectorAll(
      ".about__portrait, .about__body, .skills__group, .project, .design-card, .pub, .work__intro, .section__label"
    );
    revealTargets.forEach(function (el) { el.classList.add("reveal"); });
  
    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealTargets.forEach(function (el) { io.observe(el); });
  
      // slight stagger for grouped items
      document.querySelectorAll(".skills__group").forEach(function (el, i) {
        el.style.transitionDelay = (i * 60) + "ms";
      });
      document.querySelectorAll(".project").forEach(function (el, i) {
        el.style.transitionDelay = (i % 2 * 90) + "ms";
      });
      document.querySelectorAll(".design-card").forEach(function (el, i) {
        el.style.transitionDelay = (i % 2 * 120) + "ms";
      });
    } else {
      revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
    }
  
    /* ---------------------------------------------------------
       4. Mobile nav toggle.
    --------------------------------------------------------- */
    var burger = document.querySelector(".nav__burger");
    var links = document.querySelector(".nav__links");
    if (burger && links) {
      burger.addEventListener("click", function () {
        var open = links.classList.toggle("nav__links--open");
        burger.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        links.style.display = open ? "flex" : "";
      });
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          links.style.display = "";
          burger.classList.remove("is-open");
          links.classList.remove("nav__links--open");
          burger.setAttribute("aria-expanded", "false");
        });
      });
    }
  
    /* ---------------------------------------------------------
       5. Active nav link highlight on scroll.
    --------------------------------------------------------- */
    var sections = document.querySelectorAll(".section, .hero, .contact");
    var navAnchors = document.querySelectorAll(".nav__links a");
    if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
      var navIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var id = entry.target.getAttribute("id");
              navAnchors.forEach(function (a) {
                a.style.color = a.getAttribute("href") === "#" + id ? "var(--ink)" : "";
              });
            }
          });
        },
        { threshold: 0.5 }
      );
      sections.forEach(function (s) { if (s.id) navIo.observe(s); });
    }
  })();