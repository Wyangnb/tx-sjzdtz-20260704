/* eslint-disable no-unused-vars */
// 生成用于显示背景图的less

const fs = require('fs');
const getImageSize = require('image-size');

const path = require('path');

// 留空时遍历 src/img 下的全部文件夹；填写目录名时只处理指定目录。
// 支持：'bp'、'src/img/bp'、'./src/img/bp'。
const targetFolder = 'bp';
const imageRoot = path.resolve(__dirname, './src/img');

function resolveScanRoot (target = '') {
    if (!target.trim()) return imageRoot;

    const normalized = target.trim().replace(/[\\/]$/, '');
    const relativeTarget = normalized.replace(/^\.?[\\/]?src[\\/]img[\\/]?/, '');
    const scanRoot = path.resolve(imageRoot, relativeTarget);
    const relativeRoot = path.relative(imageRoot, scanRoot);
    if (relativeRoot.startsWith('..') || path.isAbsolute(relativeRoot)) {
        throw new Error(`目标文件夹必须位于 ${imageRoot} 内: ${target}`);
    }
    if (!fs.existsSync(scanRoot) || !fs.statSync(scanRoot).isDirectory()) {
        throw new Error(`目标文件夹不存在: ${scanRoot}`);
    }
    return scanRoot;
}

function getAllDirs (mypath = imageRoot) {
    const items = fs.readdirSync(mypath);

    let result = '';
    // 遍历当前目录中所有的文件和文件夹
    let strTemp = function (name) {
        if (!/\.(png|jpg|jpeg)$/i.test(name) || /_2x/i.test(name)) {
            return;
        }
        const { width, height } = getImageSize(name);
        const name1 = name.replace(/\\/g, '/');
        const name2 = name1.replace(`${imageRoot.replace(/\\/g, '/')}/`, '');
        const name3 = path.basename(name2).replace(/\.\w*$/, '');
        result += `
.img_${name3} {
    background-image: url('@{img}/${name2}');
}
        `;
        result += `
.img_${name3}_s {
    background-image: url('@{img}/${name2}');
    width: ${width / 100}rem;
    height: ${height / 100}rem;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
}
        `;

    };
    items.forEach(item => {
        let temp = path.join(mypath, item);

        if (fs.statSync(temp).isDirectory()) {
            const nested = getAllDirs(temp);
            result += nested.result;
        } else {
            strTemp(temp);
        }
    });

    return result;
};

const scanRoot = resolveScanRoot(targetFolder);
const lessContent = getAllDirs(scanRoot);
fs.writeFile(path.join(path.resolve(__dirname), './src/less/imgs_bp.less'), `@img: '../img/';` + lessContent, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log('File saved successfully!');
});
