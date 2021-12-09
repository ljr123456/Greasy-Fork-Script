// ==UserScript==
// @name         快速查看密码
// @namespace    http://tampermonkey.net/
// @version      0.1.3
// @description  鼠标移动到密码框自动显示密码, 移出恢复.
// @author       felix
// @include      *
// @require      https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js
// ==/UserScript==

(function () {
    'use strict';

    var interval = setInterval(handle, 2000)

    function handle() {
        clearInterval(interval)
        $("input:password").each((index, element) => {
            element.addEventListener("mouseover", function () {
                $(element).attr("type", "text");
            });
            element.addEventListener("mouseout", function () {
                $(element).attr("type", "password");
            });
        });
    }

})();