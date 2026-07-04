const fs = require('fs');
const path = require('path');

let distPath = './dist/';
let htmlPath = path.join(distPath, 'index.html');
// let cssPath = './dist/a20230707reserve/';
// let jsPath = './dist/a20230707reserve/ossweb-img/js/';
let mainJsPath = './dist/ossweb-img/js/lib/main.js';
// let newMainJsPath = './dist/ossweb-img/main.js';

// 修改html
let htmlStr = fs.readFileSync(htmlPath).toString();
// htmlStr = htmlStr.replace('js/lib/main.js', 'main.js');
// htmlStr = htmlStr.replace(/<script type="text\/javascript" src="js\/main.\S+.js"><\/script>/, '');
fs.writeFileSync(htmlPath, htmlStr);

// 修改css
// const cssFiles = fs.readdirSync(cssPath);
// cssFiles.map(item => {
//     let temp = path.join(cssPath, item);

//     let str = fs.readFileSync(temp).toString();
//     str = str.replaceAll('url(img/', 'url(../img/');

//     fs.writeFileSync(temp, str);
// });

// 修改js
let jsStr = fs.readFileSync(mainJsPath).toString();
jsStr = jsStr.replaceAll('../../img/', 'https://game.gtimg.cn/images/dfm/cp/a20240729directory/img/');
jsStr = jsStr.replaceAll('./img/', 'https://game.gtimg.cn/images/dfm/cp/a20240729directory/img/');
// jsStr = jsStr.replaceAll('../../img/', 'https://qrss.treedom.cn/sjzdtz4/img/');
// jsStr = jsStr.replaceAll('./img/', 'https://qrss.treedom.cn/sjzdtz4/img/');
fs.writeFileSync(mainJsPath, jsStr);

// // 删除多余的js文件

// const jsFiles = fs.readdirSync(jsPath);
// jsFiles.map(item => {
//     let temp = path.join(jsPath, item);

//     if (item.indexOf('.js') > -1 && item !== 'main.js') {
//         fs.rmSync(temp);
//     }
// });

// 移动main.js文件
// try {
//     fs.renameSync(mainJsPath, newMainJsPath);
// } catch (err) {
// }
