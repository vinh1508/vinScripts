// ==UserScript==
// @name            Omzero Get Access Token
// @namespace       https://vfa-vinhtt.github.io
// @description     get access_token
// @version         1.0.7
// @icon
// @author          vinhtt
// @license         MIT
// @connect         self
// @include         https://data-*.omronconnect.*/app/oauth2-frontend/static/result.html?*
// @run-at          document-idle
// @noframes
// @grant none
// ==/UserScript==

(function(window, document) {
    "use strict";
    let includes = ["provider_user_id", "oauth_token", "refresh_token"];
    let paramsOrigin = window.location.href
        .split(/\?|\&/)
        .filter(value => value.split("=").length === 2 && value.split("=") && includes.includes(value.split("=")[0]))
        .map(item => {
            let [key, value] = item.split("=") || [];
            key = key.replace("provider_user_id", "ogsc_id").replace("oauth_token", "token_test");
            return [key, value];
        });

    let params = paramsOrigin.map(([key, value]) => `${key}=${value}`).join("&");
    let linkLocal = `http://localhost:[port]/#/?${params}`;
    let linkServer = `https://cdn-s3-[env]-apne1-[code].zero-events.com/user-app/index.html#/?${params}`;

    window.APP_PARAMS = params;
    let $container =  document.querySelector(".alert-warning");
    if(!$container) {
        $container =  document.querySelector(".alert-success");
    }
    $container.insertAdjacentHTML(
        "beforeEnd",
        `
        <section>
            <p>
                <select class="sel-code" style="height: 30px;">
                    <option value="hi875">Omzero (ゼロイベント)</option>
                    <option value="cd009">CW-Wellness (チャレンジ)</option>
                </select>
                <select class="sel-env" style="height: 30px;">
                    <option value="dev">development</option>
                    <option value="local">localhost</option>
                    <option value="stg">staging</option>
                    <option value="prod">production</option>
                </select>
            </p>
            <p>
                <ul>
                    ${paramsOrigin
                        .map(([key, value]) => `<li><label>${key}</label>=<strong>${value}</strong></li>`)
                        .join("")}
                </ul>
            </p>
            <p>Link UserApp:<br/> <a class="link-app" href="#"></a><p>
        </section>`
    );
    function updateLink() {
        let env = document.querySelector(".sel-env").value;
        let code = document.querySelector(".sel-code").value;

        let link = linkServer.replace("[env]", env).replace("[code]", code);
        if (env === "local") {
            link = linkLocal;
            if (code === "cd009") {
                link = link.replace("[port]", 3009);
            } else {
                link = link.replace("[port]", 3000);
            }
        }
        let $a = document.querySelector(".link-app");
        $a.setAttribute("href", link);
        $a.text = link;
    }
    document.querySelector(".sel-code").onchange = function(e) {
        updateLink();
    };
    document.querySelector(".sel-env").onchange = function(e) {
        updateLink();
    };
    setTimeout(() => {
        updateLink();
    }, 1000);
})(window, document);
