const fs = require('fs');
const path = require('path');

let distPath = './dist/';
let htmlPath = path.join(distPath, 'index.html');
let cssPath = './dist/css/';
let jsPath = './dist/js/';
let mainJsPath = './dist/js/lib/main.js';
let newMainJsPath = './dist/js/main.js';
let LanguageJsPath = './dist/js/lib/language.js';
let newLanguageJsPath = './dist/js/language.js';

// 修改html
let htmlStr = fs.readFileSync(htmlPath).toString();
htmlStr = htmlStr.replace('js/lib/main.js', 'js/main.js');
htmlStr = htmlStr.replace('js/lib/language.js', 'js/language.js');
htmlStr = htmlStr.replace(/<script type="text\/javascript" src="js\/main.\S+.js"><\/script>/, '');
fs.writeFileSync(htmlPath, htmlStr);

// 修改css
const cssFiles = fs.readdirSync(cssPath);
cssFiles.map(item => {
    let temp = path.join(cssPath, item);

    let str = fs.readFileSync(temp).toString();
    str = str.replaceAll('url(img/', 'url(../img/');

    fs.writeFileSync(temp, str);
});

// 修改js
let jsStr = fs.readFileSync(mainJsPath).toString();
jsStr = jsStr.replaceAll('/img/', '../img/');
fs.writeFileSync(mainJsPath, jsStr);

// 删除多余的js文件

const jsFiles = fs.readdirSync(jsPath);
jsFiles.map(item => {
    let temp = path.join(jsPath, item);

    if (item.indexOf('.js') > -1 && item !== 'main.js') {
        fs.rmSync(temp);
    }
});

// 移动main.js文件
try {
    fs.renameSync(mainJsPath, newMainJsPath);
    fs.renameSync(LanguageJsPath, newLanguageJsPath);
} catch (err) {
}
