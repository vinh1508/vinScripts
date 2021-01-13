// ==UserScript==
// @name            Skip Ads Youtube
// @namespace       https://vfa-vinhtt.github.io
// @description     Transfer URL from staging into develop
// @version         1.0.0
// @icon
// @author          vinhtt
// @license         MIT
// @connect         self
// @include         https://www.youtube.com/*
// @run-at          document-idle
// @noframes
// @grant none
// ==/UserScript==

(function () {
  "use strict";
  setInterval(function () {
    try {
      var overrayAd = document.querySelector('button[class*="-ad-overlay-"]');
      if (overrayAd && overrayAd.click) {
        overrayAd.click();
        console.log("overray ad closed");
      }
    } catch (e) {
      console.log("overray ad closed", e);
    }
    try {
      var skipButton = document.querySelector('button[class*="-ad-skip-"]');
      if (skipButton && skipButton.click) {
        skipButton.click();
        console.log("skipable ad closed");
      }
    } catch (e) {
      console.log("skipable ad closed", e);
    }
  }, 2000);
})();
// ytp-ad-skip-button ytp-button
