// ==UserScript==
// @name         QQAutoRedirect
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  auto redirect url when you click link at qq chat box.
// @author       Felix
// @match        https://c.pc.qq.com/middlem.html?pfurl=**
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    var times = 1000;
    while (true && times > 0) {
        if (typeof jQuery == 'undefined') {
            times--;
        } else {
            break;
        }
    }
    if (typeof jQuery !== 'undefined') {
        window.location.replace($("#url").text())
    }
})();