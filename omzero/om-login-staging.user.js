// ==UserScript==
// @name            Omzero Get Access Token
// @namespace       https://vfa-vinhtt.github.io
// @description     get access_token
// @version         1.0.3
// @icon
// @author          vinhtt
// @license         MIT
// @connect         self
// @include         https://data-stg-jp.omronconnect.mobi/app/oauth2-frontend/static/result.html?*
// @run-at          document-idle
// @noframes
// @grant none
// ==/UserScript==

(function(window, document) {
    "use strict";
    let params = [];
    window.location.href.split(/\?|\&/).forEach(item => {
        let [key, value] = item.split("=") || [];
        if (key === "provider_user_id" || key === "oauth_token" || key === "refresh_token") {
            key = key.replace("provider_user_id", "ogsc_id").replace("oauth_token", "token_test");
            params.push([key, value]);
        }
    });
    let link = "";
    params.forEach(([key, value]) => {
        link += `${key}=${value}&`;
    });
    link = "https://cdn-s3-dev-apne1-hi875.zero-events.com/omwalk/index.html#/?" + link;
    window.LINK_APP = link;
    document.querySelector(".alert-warning").insertAdjacentHTML(
        "beforeEnd",
        `<p>
            <select class="sel-link-app">
                <option value="dev">development</option>
                <option value="local">localhost</option>
            </select>
        </p>
        
        <p>Link UserApp: <a class="link-app" href="${link}">${link}</a><p>`
    );
    document.querySelector(".sel-link-app").onchange = function(e) {
        let value = e.target.value;
        let $a = document.querySelector(".link-app");
        let link = window.LINK_APP;
        if(value ==='local'){
            link = link.replace('https://cdn-s3-dev-apne1-hi875.zero-events.com/omwalk/index.html#/','http://localhost:8009/#/');
        }
        $a.setAttribute('href', link);
        $a.text = link;
    };
})(window, document);
