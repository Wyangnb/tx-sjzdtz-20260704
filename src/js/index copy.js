/* eslint-disable no-unused-vars */
/*
*
*  引入lib库文件和LESS文件
*  必须要引入,过滤器会过滤lib文件夹里面的JS文件,做一个简单的复制
*  复制到相应的文件夹
*  引入的less会对less进行编译存放到css文件夹
* */
import '../less/style.less';

/** The animate() method */
import './util/fx';
/** Animated show, hide, toggle, and fade*() methods. */
import './util/fx_methods';

import TD from './app/module/TD';
import Config from './app/Config';

// import Language from './app/language';
import Language from '../../lang_js/language';

// 多语言
const langBox = $('.btn-lang-box');
// const currLangText = $('.curr-lang-text');
const langList = $('.lang-list');
const langChild = langList.children();
let langType = 'en';
const languageObj = { 'en': 'en', 'zh': 'zh', 'ru': 'ru', 'de': 'de', 'hk': 'HK', 'tw': 'TW', 'th': 'th', 'vi': 'vi', 'id': 'id', 'pt': 'pt', 'fr': 'fr', 'es': 'es', 'tr': 'tr', 'ar': 'ar', 'ms': 'my' };
let langIsOpen = false;

// 社区按钮组
const btnGroupEn = $('.index-btn-group-en');
const btnGroupZh = $('.index-btn-group-zh');
let groupIsOpen = false;

// 海外预约
const optionTreaty = $('.option-treaty');
const optionTreatyIcon = $('.i-option-treaty');
const optionAge = $('.option-age');
const optionAgeIcon = $('.i-option-age');
const submitEmail = $('#submitEmail');

// 国内预约
const submitBindPhone = $('#submitBindPhone');

// 隐私弹窗
const treaty = $('.treaty');
const popTreatyWrap = $('.pop_treaty_wrap');

// 权限弹窗
const taskTabPop = $('.task-tab-pop');
let taskTabPopIsShow = false;

let reserveOptionNum = 0;
const resizeDom = () => {
    if (window.innerHeight > window.innerWidth) return;
    const size = (1920 / 1080) / (window.innerWidth / window.innerHeight);
    const sizeAutoList = $('.sizeAuto');
    sizeAutoList.forEach((item) => {
        if (item.className.indexOf('abcter') !== -1) {
            item.style.transform = `translate3d(-50%, -50%, 0) scale(${size})`;
        } else if (item.className.indexOf('lcter') !== -1) {
            item.style.transform = `translate3d(-50%, 0, 0) scale(${size})`;
        } else if (item.className.indexOf('tcter') !== -1) {
            item.style.transform = `translate3d(0, -50%, 0) scale(${size})`;
        } else {
            item.style.transform = `scale(${size})`;
        }
    });
    console.log(sizeAutoList);
};

// 项目初始化的一些函数
var initProject = function () {
    // 阻止微信下拉；原生js绑定覆盖zepto的默认绑定
    document.body.addEventListener('touchmove', function (e) {
        e.preventDefault();
    }, { passive: false });

    /** 解决ios12微信input软键盘收回时页面不回弹，兼容动态添加dom(腾讯登录组件)的情况 */
    var resetScroll = (function () {
        var timeWindow = 500;
        var timeout; // time in ms
        var functionName = function (args) {
            let inputEl = $('input, select, textarea');
            // TODO: 连续添加元素时，可能存在重复绑定事件的情况
            inputEl && inputEl.on('blur', () => {
                var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
                window.scrollTo(0, Math.max(scrollHeight, 0));
            });
        };

        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                functionName.apply();
            }, timeWindow);
        };
    }());
    TD.browser.versions.ios && $('body').on('DOMSubtreeModified', resetScroll);

    resizeDom();
    // debug工具
    if (TD.util.getQuery('vconsole')) {
        let script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        document.body.appendChild(script);
        script.onload = () => {
            new VConsole(); // eslint-disable-line
            console.log('Hello world');
        };
        script.src = require('./lib/vconsole.min');
    }
};
initProject();

const initLanguage = () => {
    let urlLanguage = TD.util.getQuery('language');
    console.log('urlLanguage', urlLanguage);
    if (urlLanguage !== 'zh') {
        btnGroupEn.css('display', 'flex');
    } else {
        btnGroupZh.css('display', 'flex');
    }
    let language;
    if (urlLanguage) {
        // @ts-ignore
        if (languageObj[urlLanguage]) {
            // @ts-ignore
            language = languageObj[urlLanguage];
        } else {
            // @ts-ignore
            language = languageObj[languageObj[decodeURIComponent(urlLanguage).slice(1, 3)]];
        }
        // $('.language-ctn').css('display', 'none');

        Language.change(language);
        // EventManager.trigger('changLanguage', language);
    }
};
Language.qrDom();
initLanguage();

const init = () => {
    // 加载体现在页面上
    const loadWrapEl = $('.m-loading');
    const processLineEl = loadWrapEl.find('.progress_wrap .line_wrap .inner');
    const gload = new Config.Preload(Config.pageImgs);
    let time = 0;
    gload.onloading = function (p) {
        console.log(p);
        processLineEl.css('width', p * 0.5 + '%');
    };
    gload.onload = function () {
        const timer = setInterval(() => {
            time++;
            processLineEl.css('width', 50 + time + '%');
        }, 100);

        setTimeout(() => {
            clearInterval(timer);
            if (window.innerWidth < window.innerHeight) {
                processLineEl.css('width', '97%');
            } else {
                processLineEl.css('width', '85.5%');
            }
            loadWrapEl.fadeOut();
            $('.m-index').fadeIn();
        }, 3000);

        // processLineEl.css('width', '271px');
    };
    gload.onfail = function (msg) {
        console.log(msg);
    };
    gload.load();

    // 打开语言列表
    langBox.click(() => {
        langIsOpen = !langIsOpen;
        langIsOpen ? langBox.attr('class', 'btn-lang-box open') : langBox.attr('class', 'btn-lang-box');
    });

    // 语言切换
    langList.click((e) => {
        console.log(langChild);
        langChild.forEach((item) => {
            item.className = 'lang-item';
            console.log(item);
        });
        e.target.className = 'lang-item click';
        // currLangText.text(e.target.innerText);
        langType = e.target.dataset.value;

        $('html').attr('class', langType);
        Language.change(langType);

        if (langType !== 'zh') {
            btnGroupZh.css('display', 'none');
            btnGroupEn.css('display', 'flex');
        } else {
            btnGroupEn.css('display', 'none');
            btnGroupZh.css('display', 'flex');
        }

        console.log(langType, e);
    });

    const observe = () => {
        var targetNode = $('.btn_submit')[0];// content监听的元素id
        // options：监听的属性
        var options = {
            attributes: true, childList: true, subtree: true, attributeOldValue: true
        };
        // 回调事件
        function callback (mutationsList, observer) {
            console.log(mutationsList);
            console.log(observer);
            console.log(111111111);
            if (mutationsList[0].target.dataset.usable === 'true') {
                $('.btn_wrap').attr('class', 'abcter btn_wrap usable');
            } else {
                $('.btn_wrap').attr('class', 'abcter btn_wrap');
            }
        }
        var mutationObserver = new MutationObserver(callback);
        mutationObserver.observe(targetNode, options);
    };
    observe();

    treaty.click((e) => {
        e.stopPropagation();
        popTreatyWrap.fadeIn();
    });

    $('.task-right-text').click(() => {
        if (taskTabPopIsShow) return;
        taskTabPop.attr('class', 'abcter task-tab-pop img_task_tab_pop_s language-item open');
        taskTabPopIsShow = true;
        setTimeout(() => {
            taskTabPop.attr('class', 'abcter task-tab-pop img_task_tab_pop_s language-item');
            taskTabPopIsShow = false;
        }, 2000);
    });

    // 打开社区(移动端)
    $('.btn-group-open').click(() => {
        if (!groupIsOpen) {
            btnGroupEn.attr('class', 'index-btn-group-en open');
            btnGroupZh.attr('class', 'index-btn-group-zh open');
        } else {
            btnGroupEn.attr('class', 'index-btn-group-en');
            btnGroupZh.attr('class', 'index-btn-group-zh');
        }
        groupIsOpen = !groupIsOpen;
    });

    // 所有弹窗关闭事件
    $('.pop_common .pop_icon_close').click((e) => {
        $(e.target).parent().parent().parent().fadeOut();
    });
    $('.pop_common .bg').click((e) => {
        if (TD.browser.versions.mobile || $(e.target).parent().hasClass('bgautoclosepop')) {
            $(e.target).parent().fadeOut();
        }
    });
    $('[data-autoclosepop="true"').click((e) => {
        if ($(e.target).attr('data-usable') === 'true' && $(e.target).attr('data-autoclosepop') === 'true') {
            $(e.target).parent().parent().parent().parent().fadeOut();
        }
    });

    // 平台选择
    let chooseNum = $('.pop_reserve_choose_pla_wrap .choose_wrap .btn[data-choosed="true"]').length;
    $('.pop_reserve_choose_pla_wrap .btn_wrap .btn_submit').attr('data-usable', chooseNum > 0);
    $('.pop_reserve_choose_pla_wrap .choose_wrap .btn').click((e) => {
        const rul = $(e.target).attr('data-choosed') === 'false';
        $(e.target).attr('data-choosed', rul);
        chooseNum += rul ? 1 : -1;
        $('.pop_reserve_choose_pla_wrap .btn_wrap .btn_submit').attr('data-usable', chooseNum > 0);
    });

    const showFooter = () => {
        $('#afooter').fadeIn();
        window.removeEventListener('wheel', showFooter);
        document.removeEventListener('touchmove', showFooter);
    };
    window.addEventListener('wheel', showFooter);
    document.addEventListener('touchmove', showFooter);

    // 媒体平台
    $('.m-index .icon_pla_wrap .btn_left_wrap').click((e) => {
        // console.log(e.target);
        $('.m-index .icon_pla_wrap .btn_left_wrap').toggleClass('off');
    });
    $('.m-index .icon_pla_wrap .icon_pla_all .icon_pla.icon_wx').on('mouseenter', () => {
        $('.m-index .qrcode_img').fadeIn(100);
    });
    $('.m-index .icon_pla_wrap .icon_pla_all .icon_pla.icon_wx').on('mouseleave', () => {
        $('.m-index .qrcode_img').fadeOut();
    });

    // debug
    if (document.querySelector('.btn_test_rap') && TD.util.getQuery('popTest') !== 'false') {
        let debugList = [];
        console.log('TD.util.getQuery(language)', TD.util.getQuery('language'));
        if (TD.util.getQuery('language') !== 'zh') {
            debugList = [
                ['pop-通用信息弹窗', '.pop_msg_wrap'],
                ['pop-请先登录', '.pop_login_first_wrap'],
                ['pop-邮箱预约', '.pop_reserve_email_wrap'],
                ['pop-关注discord', '.pop_follow_discord_wrap']];
        } else {
            debugList = [
                ['pop-通用信息弹窗', '.pop_msg_wrap'],
                ['pop-请先登录', '.pop_login_first_wrap'],
                ['pop-登陆方式选择', '.pop_login_choose_pla_wrap'],
                ['pop-预约成功', '.pop_reserve_sccess_wrap'],
                ['pop-解绑手机号', '.pop_unbind_phone_wrap'],
                ['pop-平台选择', '.pop_reserve_choose_pla_wrap']
            ];
        }
        debugList.forEach((ele) => {
            let btn = document.createElement('button');
            btn.innerHTML = ele[0];
            btn.style.color = 'red';
            btn.style.fontSize = '0.3rem';
            btn.style.opacity = '0.5';
            btn.style.zIndex = '30';
            document.querySelector('.btn_test_rap').append(btn);
            btn.onclick = () => {
                $(ele[1]).fadeIn(0);
            };
        });
    }
};
window.addEventListener('load', () => {
    init();
});
