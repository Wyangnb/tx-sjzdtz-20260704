/* eslint-disable no-unused-vars */
// 生成用于显示背景图的less

const fs = require('fs');
const getImageSize = require('image-size');

const path = require('path');
function getAllDirs (mypath = './src/img/') {
    const items = fs.readdirSync(mypath);

    let result = '';
    let result2x = '';
    // 遍历当前目录中所有的文件和文件夹
    let strTemp = function (name) {
        // if (name.match(/.DS_Store)/)) {
        if (!name.match(/.png|.jpg|.jpeg/) || name.match(/_2x/) || name.match(/_m/)) {
            return;
        }
        const { width, height, type } = getImageSize(name);
        let name1 = name.replace(/\\/g, '/');
        let name2 = name1.replace(/src\/img\//g, '');
        let name3 = name2.replace(/\.\w*/g, '').replace(/\w*\//g, '');
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

        result2x += `
.img_${name3} {
    background-image: url('@{img}/${name2.replace(name3, name3 + '_2x')}');
}
        `;
        result2x += `
.img_${name3}_s {
    background-image: url('@{img}/${name2.replace(name3, name3 + '_2x')}');
}
        `;
    };
    items.map(item => {
        let temp = path.join(mypath, item);

        // 若当前的为文件夹
        if (fs.statSync(temp).isDirectory()) {
            // strTemp(temp); // 存储当前文件夹的名字
            if (temp.indexOf('map') < 0) {
                result = result.concat(getAllDirs(temp));
            }
        } else { // 进入下一级文件夹访问
            if (temp.indexOf('map') < 0) {
                result = result.concat(getAllDirs(temp));
            }
     
        }
    });

    result = result + `
@media screen and (min-width: 2560px) {
` + result2x + `
}`;

    return result;
};
fs.writeFile(path.join(path.resolve(__dirname), './src/less/lv3.less'), `@img: '../img/';` + getAllDirs(), function (err) {
    if (err) {
        return console.log(err);
    }
    console.log('File saved successfully!');
});
