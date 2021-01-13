// ==UserScript==
// @name            SHOW HIDE PASSWORD
// @namespace       https://vfa-vinhtt.github.io
// @description     Transfer URL from staging into develop
// @version         1.0.0
// @icon
// @author          vinhtt
// @license         MIT
// @connect         self
// @include         *
// @run-at          document-idle
// @noframes
// @grant none
// ==/UserScript==

(function (window, document) {
  "use strict";
  setTimeout(() => {
    var elms = document.querySelectorAll('[type="password"]');
    Object.keys(elms).forEach((key) => {
      var elm = elms[key];
      var left = elm.clientWidth;
      elm.insertAdjacentHTML(
        "afterend",
        `<a href="javascript:void(0)" style="position: absolute; left:${left}px; top: 50%;transform: translate(0, -50%);" onclick="window.toggleDisplayPassword(this);">+</a>`
      );
    });
  }, 1000);

  window.toggleDisplayPassword = function ($this) {
    var newText = "";
    var newType = "";
    if ($this.previousSibling.getAttribute("type") === "password") {
      newText = "-";
      newType = "text";
    } else {
      newText = "+";
      newType = "password";
    }
    $this.previousSibling.setAttribute("type", newType);
    $this.innerText = newText;
  };
})(window, document);
