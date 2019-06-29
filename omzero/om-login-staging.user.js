// ==UserScript==
// @name            Omzero Get Access Token
// @namespace       https://vfa-vinhtt.github.io
// @description     get access_token
// @version         1.0.4
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
    let includes = ["provider_user_id", "oauth_token", "refresh_token"];
    let paramsOrigin = window.location.href
        .split(/\?|\&/)
        .filter(
            value =>
                value.split("=").length === 2 &&
                value.split("=") &&
                includes.includes(value.split("=")[0])
        ).map(item => {
            let [key, value] = item.split("=") || [];
            key = key.replace("provider_user_id", "ogsc_id").replace("oauth_token", "token_test");
            return [key, value]
        });

    let params = paramsOrigin.map(([key,value])=>`${key}=${value}`).join('&');
    let linkLocal = `http://localhost:8009/#/?${params}`;
    let linkDev = `https://cdn-s3-dev-apne1-cd009.zero-events.com/user-app/index.html#/?${params}`;
    let linkStg = `https://cdn-s3-stg-apne1-cd009.zero-events.com/user-app/index.html#/?${params}`;
    let linkPrd = `https://cdn-s3-prd-apne1-cd009.zero-events.com/user-app/index.html#/?${params}`;
    window.APP_PARAMS = params;

    document.querySelector(".alert-warning").insertAdjacentHTML(
        "beforeEnd",
        `<section>
            <p>
                <select class="sel-link-app" style="height: 30px;">
                    <option value="${linkDev}">development</option>
                    <option value="${linkLocal}">localhost</option>
                    <option value="${linkStg}">staging</option>
                    <option value="${linkPrd}">production</option>
                </select>
            </p>
            <p>
                <ul>
                    ${paramsOrigin.map(([key,value]) => `<li><label>${key}</label>: <strong>${value}</strong></li>`).join('')}
                </ul>
            </p>
            <p>Link UserApp:<br/> <a class="link-app" href="${linkDev}">${linkDev}</a><p>
        </section>`
    );

    document.querySelector(".sel-link-app").onchange = function(e) {
        let value = e.target.value;
        let $a = document.querySelector(".link-app");
        $a.setAttribute("href", value);
        $a.text = value;
    };
    
})(window, document);
