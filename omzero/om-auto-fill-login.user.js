// ==UserScript==
// @name            OMZERO-AUTO-LOGIN
// @namespace       https://vfa-vinhtt.github.io
// @description     get access_token
// @version         1.0.7
// @icon
// @author          vinhtt
// @license         MIT
// @connect         self
// @include         https://data-*.omronconnect.*/app/oauth2-frontend/login/*
// @run-at          document-idle
// @noframes
// @grant none
// ==/UserScript==

(function(window, document) {
    "use strict";
    setTimeout(() => {
        document.querySelector('[name="password"]').value = "11111111";
        document.querySelector('[name="username"]').focus();
        document.querySelector('[type="submit"]').removeAttribute("disabled");
    });
})(window, document);
