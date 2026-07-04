(function (doc, win) {
    var rootValue = 100; // 此处值与postcss配置中'postcss-pxtorem'的值一样

    var rszEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
    var reCalc = (function () {
        var reCalc = function () {
            var docEl = doc.documentElement;
            var winWidth = docEl.clientWidth;
            if (!winWidth) return;
            var fontSize;
            if (winWidth > 1720) { // PC
                fontSize = rootValue * winWidth / 1920;
            } else { // mobile
                fontSize = rootValue * 1720 / 1920;
            }
            docEl.style.fontSize = fontSize + 'px';
            return reCalc;
        };
        return reCalc();
    })();

    reCalc();
    setTimeout(function () {
        reCalc();
    }, 300);
    win.addEventListener('load', reCalc, false);
    win.addEventListener(rszEvt, reCalc, false);
    if (!doc.addEventListener) return;
    doc.addEventListener('DOMContentLoaded', reCalc, false);
})(document, window);
// (function (doc, win) {
//     var rootValue = 100; // 此处值与postcss配置中'postcss-pxtorem'的值一样

//     var rszEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
//     var reCalc = (function () {
//         var reCalc = function () {
//             var docEl = doc.documentElement;
//             var winWidth = docEl.clientWidth;
//             if (!winWidth) return;
//             var fontSize;
//             if (winWidth > 768) { // PC
//                 fontSize = rootValue * winWidth / 1920;
//             } else { // mobile
//                 fontSize = rootValue * winWidth / 750;
//             }
//             docEl.style.fontSize = fontSize + 'px';
//             return reCalc;
//         };
//         return reCalc();
//     })();

//     reCalc();
//     setTimeout(function () {
//         reCalc();
//     }, 300);
//     win.addEventListener('load', reCalc, false);
//     win.addEventListener(rszEvt, reCalc, false);
//     if (!doc.addEventListener) return;
//     doc.addEventListener('DOMContentLoaded', reCalc, false);
// })(document, window);
