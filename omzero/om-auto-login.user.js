// ==UserScript==
// @name            OMZERO-AUTO-LOGIN
// @namespace       https://vfa-vinhtt.github.io
// @description     get access_token
// @version         1.0.0
// @icon
// @author          vinhtt
// @license         MIT
// @connect         self
// @include         https://data-stg-jp.omronconnect.mobi/app/oauth2-frontend/login/bdf72f34?response_type=code&*
// @run-at          document-idle
// @noframes
// @grant none
// ==/UserScript==

(function(window, document) {
    "use strict";
    setTimeout(() => {
        var id_prefix = localStorage.getItem("id_prefix") || "";
        var id_index = Number(localStorage.getItem("id_index") || 0) + 1;
        document.querySelector('[name="username"]').value = id_prefix + "" + id_index;
        document.querySelector('[name="password"]').value = "11111111";
        document.querySelector('[type="submit"]').removeAttribute("disabled");

        // save id_index
        localStorage.setItem("id_index", id_index);
        document.querySelector('[type="submit"]').click();
    }, 1000);
})(window, document);
