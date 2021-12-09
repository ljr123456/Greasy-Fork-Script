// ==UserScript==
// @name         自定义哔哩哔哩视频播放速度,记住播放速度
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  可以使用按键 z(恢复1倍速)、x（减0.1倍速）、c（加0.1倍速),可通过菜单记住播放速度
// @author       felix
// @icon         chrome://favicon/http://www.bilibili.com/
// @match        https://www.bilibili.com/video/*
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// ==/UserScript==
(function () {
    'use strict';
    

    // console.log(`[${GM_info.script.name}]: 开始运行`);

    // ===================================================配置区=====================================================================================
    var STORAGE_KEY = {
        BILIBILI_VIDEO_SPEED_SIWTCH: "bilibili_video_speed_switch",
        BILIBILI_VIDEO_SPEED: "bilibili_video_speed"
    };

    var SETTING = {
        STEP_SIZE: 0.1,
        MAX_SPEED: 5,
        MIN_SPEED: 0.1,
        REMEMBER_SPEED_MENU_ID: null,
    };

    var DOM_NAME = {
        SPEED: "#speed",
        VIDEO: "bwp-video",
        JUMP_BUTTON: ".bilibili-player-electric-panel-jump",
        CUSTOMER_TOAST: ".bilibili-player-volumeHint.felix",
        CUSTOMER_TOAST_SUB_DOM: ".bilibili-player-volumeHint.felix .bilibili-player-volumeHint-text",
    }

    var CONSTANT_DATA = {
        REMOVE_SPEED_TOAST_INTERVAL: null
    }

    // ===================================================加载区=====================================================================================
    setTimeout(loading, 3000);

    function loading() {
        addToast();
        addButton();
        loadSpeed();

        addInterval();
    }

    function addInterval() {
        addSpeedInterval();
        addJumpElectricInterval();
    }

    // 每3秒检测一次播放速度
    function addSpeedInterval() {
        return setInterval(() => {
            var videoSpeed = getVideoSpeed();
            var videoSpeedTextNumber = getVideoSpeedTextNumber();
            if (Number(videoSpeed) !== videoSpeedTextNumber) {
                changeSpeed(videoSpeedTextNumber);
            }
        }, 3000);
    }

    // 跳过充电
    function addJumpElectricInterval() {
        return setInterval(() => {
            if ($(DOM_NAME.JUMP_BUTTON).length > 0) {
                $(DOM_NAME.JUMP_BUTTON).trigger('click')
            }
        }, 500)
    }

    // 添加按钮
    function addButton() {
        var div = document.createElement("div");
        div.innerHTML = '<button id="reduce" style="width:15px;margin:0 3px">-</button><button style="width:30px"><sapn id="speed">1<span/></button><button id="add" style="width:15px;margin:0 3px">+</button>';
        document.getElementById("arc_toolbar_report").appendChild(div);
        document.getElementById("reduce").onclick = function () { reduceSpeed(); };
        document.getElementById("add").onclick = function () { addSpeed(); };
    }

    // 是否有toast
    function hasToast() {
        return $(DOM_NAME.CUSTOMER_TOAST) == null;
    }

    // 添加 调整倍速的 toast
    function addToast() {
        var div = $(
            `
                <div class="bilibili-player-volumeHint felix" style="opacity: 100; display: none; ">
                    <span class="bilibili-player-volumeHint-text">felix</span>
                </div>
            `
        )

        $(".bilibili-player-video-wrap").append(div);
    }

    // 加载播放速度
    function loadSpeed() {
        var speed = localStorage.getItem(STORAGE_KEY.BILIBILI_VIDEO_SPEED);
        if (speed) {
            changeSpeed(speed, false);
            loadRemoveSpeedMenu();
        } else {
            loadSaveSpeedMenu();
        }
    }

    // ===================================================获取控件区=====================================================================================
    // 获取 video控件
    function getVideo() {
        return document.querySelector(DOM_NAME.VIDEO);
    }

    // ===================================================键盘监听区=====================================================================================
    document.onkeydown = function (e) {
        if (e.target.nodeName !== 'BODY') return;
        if (/^[zxcZXC]$/.test(e.key)) {
            if (e.key === 'z' || e.key === 'Z') changeSpeed(1, true);
            if (e.key === 'x' || e.key === 'X') reduceSpeed();
            if (e.key === 'c' || e.key === 'C') addSpeed();
        }
    };


    // ==================================================播放速度=================================================================================
    // 加载记住播放速度菜单
    function loadSaveSpeedMenu() {
        if (SETTING.REMEMBER_SPEED_MENU_ID) {
            GM_unregisterMenuCommand(SETTING.REMEMBER_SPEED_MENU_ID);
        }
        SETTING.REMEMBER_SPEED_MENU_ID = GM_registerMenuCommand("记住播放速度", openSaveSpeedSitch);
    }

    // 加载忘记播放速度菜单
    function loadRemoveSpeedMenu() {
        if (SETTING.REMEMBER_SPEED_MENU_ID) {
            GM_unregisterMenuCommand(SETTING.REMEMBER_SPEED_MENU_ID);
        }
        SETTING.REMEMBER_SPEED_MENU_ID = GM_registerMenuCommand("忘记播放速度", closeSaveSpeedSitch);
    }

    // 开启记住播放速度开关
    function openSaveSpeedSitch() {
        localStorage.setItem(STORAGE_KEY.BILIBILI_VIDEO_SPEED_SIWTCH, true);
        setSpeedToStorage();
    }

    // 关闭记住播放速度开关
    function closeSaveSpeedSitch() {
        localStorage.setItem(STORAGE_KEY.BILIBILI_VIDEO_SPEED_SIWTCH, false);
        removeSpeedFromStorage();
    }

    // 保存播放速度到localStorage
    function setSpeedToStorage() {
        localStorage.setItem(STORAGE_KEY.BILIBILI_VIDEO_SPEED, getVideoSpeed());
        loadRemoveSpeedMenu();
    }

    // 从localStorage中删除保存的播放速度
    function removeSpeedFromStorage() {
        localStorage.removeItem(STORAGE_KEY.BILIBILI_VIDEO_SPEED);
        loadSaveSpeedMenu();
    }

    // 获取当前播放速度
    function getVideoSpeed() {
        return getVideo().playbackRate;
    }

    // 获取当前展示的播放速度
    function getVideoSpeedTextNumber() {
        return Number($(DOM_NAME.SPEED).text());
    }

    // 改变展示的播放速度文字
    function changeSpeedText(playSpeed) {
        $(DOM_NAME.SPEED).text(playSpeed);
    }

    // 减速
    function reduceSpeed(stepSize) {
        if (!stepSize) {
            stepSize = SETTING.STEP_SIZE;
        }
        var playSpeed = Number(getVideoSpeedTextNumber() - stepSize).toFixed(1);
        changeSpeed(playSpeed, true);
    }

    // 加速
    function addSpeed(stepSize) {
        if (!stepSize) {
            stepSize = SETTING.STEP_SIZE;
        }
        var playSpeed = Number(getVideoSpeedTextNumber() + stepSize).toFixed(1);
        changeSpeed(playSpeed, true);
    }

    // 缓慢移除toast
    function hideSpeedToast() {
        if (CONSTANT_DATA.REMOVE_SPEED_TOAST_INTERVAL) {
            clearInterval(CONSTANT_DATA.REMOVE_SPEED_TOAST_INTERVAL);
        }
        CONSTANT_DATA.REMOVE_SPEED_TOAST_INTERVAL = setInterval(() => {
            var opacity = $(DOM_NAME.CUSTOMER_TOAST).css("opacity")
            opacity = opacity - 0.05;
            if (opacity <= 0.7) {
                $(DOM_NAME.CUSTOMER_TOAST).css("opacity", 0);
                $(DOM_NAME.CUSTOMER_TOAST).css("dispaly", "none");
                clearInterval(CONSTANT_DATA.REMOVE_SPEED_TOAST_INTERVAL);
            } else {
                $(DOM_NAME.CUSTOMER_TOAST).css("opacity", opacity);
            }
        }, 200);
    }

    // 改变播放速度
    function changeSpeed(playSpeed, showToast) {
        if (playSpeed && playSpeed >= SETTING.MIN_SPEED && playSpeed <= SETTING.MAX_SPEED) {
            doChangeSpeed(playSpeed);
            changeSpeedText(playSpeed);
            var saveSpeedswitch = localStorage.getItem(STORAGE_KEY.BILIBILI_VIDEO_SPEED_SIWTCH);
            if (saveSpeedswitch) {
                setSpeedToStorage();
            }
            if (!hasToast()) {
                addToast();
            }
            if (showToast) {
                $(DOM_NAME.CUSTOMER_TOAST).attr("style", '{ "opacity": 100, "display": "block" }');
                $(DOM_NAME.CUSTOMER_TOAST_SUB_DOM).text(playSpeed);
                hideSpeedToast();
            }
        }
    }

    // 执行调整播放速度
    function doChangeSpeed(playSpeed) {
        getVideo().playbackRate = Number(playSpeed);
    }
})();