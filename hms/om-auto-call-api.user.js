// ==UserScript==
// @name            HMS-REGISTRAION-SITE-DETECT
// @namespace       https://vfa-vinhtt.github.io
// @description     Transfer URL from staging into develop
// @version         1.0.0
// @icon
// @author          vinhtt
// @license         MIT
// @connect         self
// @include         https://alb-stg-*zero-events.com/registration-site/registration?*
// @run-at          document-idle
// @noframes
// @grant none
// ==/UserScript==

(function(window, document) {
    "use strict";
    var dev =  'https://alb-dev-apne1-cd007-01.jp-hms.com';
    var url = `${dev}${location.pathname}${location.search}`
    var $body = document.querySelector('.registration-body');
    $body.insertAdjacentHTML('beforebegin',
    `
    <section style="margin-left: 50px;">
        <a href="${url}">Go to Dev</a>
    </section>
    `);

})(window, document);
