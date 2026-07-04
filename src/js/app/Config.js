import Preload from './module/Preload.js';

var Config = {};

// ajax请求链接
Config.requireUrl = '';

// 图片路径前缀
// 如kf文件里图片不使用require时 img地址：Config.imgPath
Config.imgPath = process.env.NODE_ENV === 'handover' ? process.env.PATH : process.env.PATH + 'img/';

Config.Preload = Preload;

const PCLG = [
    {
        name: 'index_bg',
        url: require('../../img/index_bg_2x.jpg')
    }
];

const mobile = [
    {
        name: 'index_bg_m',
        url: require('../../img/index_bg_m.jpg')
    }
];

// 预加载的图片
Config.pageImgs = {
    imgs: [
        {
            name: 'index_bg',
            url: require('../../img/index_bg.jpg')
        },
        {
            name: 'task_pop_bg',
            url: require('../../img/task_pop_bg.png')
        },
        {
            name: 'task_info_bg',
            url: require('../../img/task_info_bg.png')
        },
        {
            name: 'pop_reserve_en',
            url: require('../../img/pop_reserve_en.png')
        },
        {
            name: 'index_title_ani',
            url: require('../../img/index_title_ani.png')
        },
        {
            name: 'index_map',
            url: require('../../img/index_map.png')
        },
        {
            name: 'index_bg',
            url: require('../../img/index_bg.jpg')
        }
    ],
    sprites: [
        /*
        {
            el: $('.m-game .kf-game-video'),
            pathPrefix: Config.imgPath,
            postfix: 'jpg'
        }
        */
    ],
    keyimgs: [
        /*
        {
            el: $('.m-game .kf-game-video'),
            pathPrefix: Config.imgPath,
            postfix: 'jpg'
        }
        */
    ]
};

if (navigator.userAgent.match(/AppleWebKit.*Mobile.*/)) {
    Config.pageImgs.imgs = mobile;
} else if (window.innerWidth >= 2560) {
    Config.pageImgs.imgs = PCLG;
}

module.exports = Config;
