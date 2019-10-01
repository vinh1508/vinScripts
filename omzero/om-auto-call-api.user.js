// ==UserScript==
// @name            OMZERO-AUTO-CALL-API
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
    let $container = document.querySelector(".alert-warning");
    if (!$container) {
        $container = document.querySelector(".alert-success");
    }
    $container.insertAdjacentHTML(
        "beforeEnd",
        `
          <section>
            <div id="ConfirmPolicy-Message">...</div>
          </section>
        `
    );
    let linkOmronLogin = `https://data-stg-jp.omronconnect.mobi/api/apps/vciq87jauff4/integration/webauth/connect?id=openidconnect.simple&result_url=https://data-stg-jp.omronconnect.mobi/app/oauth2-frontend/static/result.html`;

    const ConfirmPolicy = (token, ogsc) => {
        fetch("https://alb-stg-apne1-hi875-01.zero-events.com/api/confirm-policy", {
            headers: {
                "access-token": token,
                "ogsc-id": ogsc,
                Authorization: "T01aRVJPIDIwMTgwNjEx",
                Referer: "https://cdn-s3-stg-apne1-hi875.zero-events.com/index.html"
            }
        })
            .then(resp => resp.json())
            .then(json => {
                console.log(json);
                document.querySelector("#ConfirmPolicy-Message").textContent = JSON.stringify(json);
                setTimeout(() => {
                    location.replace(linkOmronLogin);
                }, 1000);
            });
    };
    let accessToken, ogscId;
    let includes = ["provider_user_id", "oauth_token", "refresh_token"];
    let paramsOrigin = location.href
        .split(/\?|\&/)
        .filter(value => value.split("=").length === 2 && value.split("=") && includes.includes(value.split("=")[0]))
        .map(item => {
            let [key, value] = item.split("=") || [];
            if (key === "provider_user_id") {
                ogscId = value;
                key = "ogsc_id";
            } else if (key === "oauth_token") {
                accessToken = value;
                key = "token_test";
            }
            return [key, value];
        });

    // call api
    ConfirmPolicy(accessToken, ogscId);
})(window, document);
