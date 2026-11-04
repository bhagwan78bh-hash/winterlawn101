(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var progress = document.getElementById("scrollProgress");
  var menuToggle = document.getElementById("menuToggle");
  var nav = document.getElementById("primaryNav");

  /* ---------- header state + scroll progress ---------- */
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle("is-solid", y > 32 || document.body.classList.contains("nav-open"));

    var max = document.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
    progress.style.width = pct + "%";
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  function closeMenu() {
    document.body.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    onScroll();
  }

  menuToggle.addEventListener("click", function () {
    var isOpen = document.body.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    onScroll();
  });

  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
      closeMenu();
      menuToggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) closeMenu();
  });

  /* ---------- reveal on scroll ---------- */
  var revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    revealItems.forEach(function (el) { io.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- grass tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function activateTab(tab) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.classList.toggle("is-active", selected);
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !selected;
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { activateTab(tab); });

    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(index + 1) % tabs.length];
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        activateTab(next);
        next.focus();
      }
    });
  });

  /* ---------- soil temperature ---------- */
  var slider = document.getElementById("soilTemp");
  var tempValue = document.getElementById("tempValue");
  var tempState = document.getElementById("tempState");
  var tempCopy = document.getElementById("tempCopy");

  var bands = [
    {
      max: -0.5,
      label: "Frozen",
      tone: "frozen",
      copy: "Nothing is growing and nothing needs you. Stay off the turf — footprints in frozen grass break crowns that won't heal until spring."
    },
    {
      max: 5,
      label: "Dormant",
      tone: "dormant",
      copy: "Top growth has stopped, roots are idling. Clear leaves when dry, skip fertilizer, and keep traffic to a minimum."
    },
    {
      max: 10,
      label: "Holding pattern",
      tone: "holding",
      copy: "Roots are still working even if the mower isn't. This is the window for aeration, lime if a soil test says so, and a final tidy."
    },
    {
      max: 99,
      label: "Still growing",
      tone: "growing",
      copy: "Grass is active. Keep mowing on the one-third rule, water only when dry, and finish any autumn feeding while the soil is open."
    }
  ];

  function updateTemp() {
    var value = Number(slider.value);
    var band = bands[0];

    for (var i = 0; i < bands.length; i++) {
      if (value <= bands[i].max) { band = bands[i]; break; }
    }

    tempValue.textContent = String(value);
    tempValue.setAttribute("data-tone", band.tone);
    tempState.textContent = band.label;
    tempState.setAttribute("data-tone", band.tone);
    tempCopy.textContent = band.copy;
    slider.setAttribute("aria-valuetext", value + " degrees Celsius, " + band.label.toLowerCase());
  }

  slider.addEventListener("input", updateTemp);
  updateTemp();

  /* ---------- newsletter ---------- */
  var form = document.getElementById("checklistForm");
  var emailInput = document.getElementById("email");
  var formNote = document.getElementById("formNote");
  var formSuccess = document.getElementById("formSuccess");
  var noteDefault = formNote.innerHTML;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!emailInput.value.trim() || !emailInput.checkValidity()) {
      formNote.classList.add("form-error");
      formNote.textContent = "That email doesn't look right. Mind checking it?";
      emailInput.setAttribute("aria-invalid", "true");
      emailInput.focus();
      return;
    }

    formNote.classList.remove("form-error");
    formNote.innerHTML = noteDefault;
    emailInput.removeAttribute("aria-invalid");

    form.hidden = true;
    formSuccess.hidden = false;
    formSuccess.setAttribute("tabindex", "-1");
    formSuccess.focus();
  });

  emailInput.addEventListener("input", function () {
    if (emailInput.getAttribute("aria-invalid") === "true") {
      emailInput.removeAttribute("aria-invalid");
      formNote.classList.remove("form-error");
      formNote.innerHTML = noteDefault;
    }
  });

  /* ---------- legal dialogs ---------- */
  var openDialogs = [];

  function lockBody(locked) {
    document.body.classList.toggle("is-locked", locked);
  }

  function openDialog(name) {
    var dialog = document.getElementById(name + "Dialog");
    if (!dialog) return;

    document.querySelectorAll("dialog[open]").forEach(function (d) { d.close(); });
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    lockBody(true);
    var body = dialog.querySelector(".legal-body");
    if (body) body.scrollTop = 0;
  }

  document.querySelectorAll("[data-dialog]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      openDialog(trigger.getAttribute("data-dialog"));
    });
  });

  document.querySelectorAll("dialog.legal").forEach(function (dialog) {
    openDialogs.push(dialog);

    dialog.querySelectorAll("[data-close]").forEach(function (btn) {
      btn.addEventListener("click", function () { dialog.close(); });
    });

    dialog.addEventListener("close", function () {
      if (!document.querySelector("dialog[open]")) lockBody(false);
    });

    dialog.addEventListener("click", function (e) {
      if (e.target !== dialog) return;
      var rect = dialog.getBoundingClientRect();
      var inside = e.clientX >= rect.left && e.clientX <= rect.right &&
                   e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) dialog.close();
    });
  });

  /* ---------- footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
