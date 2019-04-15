// ==UserScript==
// @name            Omzero Get Access Token
// @namespace       https://vfa-vinhtt.github.io
// @description     get access_token
// @version         1.0.0
// @icon         
// @author          vinhtt
// @license         MIT
// @connect         self
// @run-at          document-idle
// @include         https://data-stg-jp.omronconnect.mobi/app/oauth2-frontend/static/result.html?*
// ==/UserScript==

(function (window, document) {
    'use strict';
    alert(window.location.href);
})(window, document);