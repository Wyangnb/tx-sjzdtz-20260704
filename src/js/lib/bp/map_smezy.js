var smezyInfo = {
    width: 8820.758789,
    height: 8825.270508,
    boundsW: -256,
    boundsH: 256,
    centerX: 91930.156250,
    centerY: 140600.812500,
    minZoom: 1,
    initZoom: 1,
    maxZoom: 3,
    bj: 128,
    initX: -105,
    initY: 135
};

// 点位由菜单按需传入地图，不会在进入模式时自动显示。
var selectRegion_smezy = [
    {
        name: '阿萨拉 庭院后门',
        x: "91468.000000",
        y: "-133084.000000",
    },
    {
        name: '中区 后花园',
        x: "92572.000000",
        y: "-136452.000000",
    },
    {
        name: '中区 庭院',
        x: "92500.000000",
        y: "-140492.000000",
    },
    {
        name: 'B区 后点',
        x: "89396.000000",
        y: "-135800.000000",
    },
    {
        name: 'B区 前厅',
        x: "89828.000000",
        y: "-138580.000000",
    },
    {
        name: 'B区 二楼展馆',
        x: "87440.000000",
        y: "-138316.000000",
    },
    {
        name: 'B目标点',
        x: "88344.000000",
        y: "-141344.000000",
    },
    {
        name: '中区 走廊',
        x: "91064.000000",
        y: "-142780.000000",
    },
    {
        name: '中区 侧路',
        x: "90480.000000",
        y: "-141192.000000",
    },
    {
        name: '中区 旋转楼梯',
        x: "93516.000000",
        y: "-143364.000000",
    },
    {
        name: '哈夫克 泳池',
        x: "91472.000000",
        y: "-146840.000000",
    },
    {
        name: 'B区 后廊',
        x: "87680.000000",
        y: "-143356.000000",
    },
    {
        name: 'A区 后侧',
        x: "96528.000000",
        y: "-143184.000000",
    },
    {
        name: 'A目标点',
        x: "96728.000000",
        y: "-140556.000000",
    },
    {
        name: 'A区 连接',
        x: "94344.000000",
        y: "-141152.000000",
    },
    {
        name: 'A区 侧路',
        x: "94348.000000",
        y: "-139436.000000",
    },
    {
        name: 'A区 前廊',
        x: "96844.000000",
        y: "-135860.000000",
    }
];

// 进入模式时默认显示的区域。
var selectPoint_smezy = [
    {
        "type": "normal",
        "name": "区域点位",
        "point_name": "A点",
        "icon": "icon_csd",
        "img": "smezy_a",
        "x": "97030",
        "y": "-140256",
    },
    {
        "type": "normal",
        "name": "区域点位",
        "point_name": "B点",
        "icon": "icon_csd",
        "img": "smezy_b",
        "x": "87795",
        "y": "-141256",
    },
    {
        "type": "normal",
        "name": "区域点位",
        "point_name": "中庭",
        "icon": "icon_csd",
        "img": "smezy_zt",
        "x": "92413",
        "y": "-140291",
    },
    {
        "type": "normal",
        "name": "区域点位",
        "point_name": "可炸开墙壁",
        "icon": "icon_csd",
        "img": "smezy_qb",
        "x": "93722",
        "y": "-140428",
    },
    {
        "type": "normal",
        "name": "区域点位",
        "point_name": "防守方出生点",
        "icon": "icon_csd",
        "img": "smezy_ff",
        "x": "91689",
        "y": "-145737",
    },
    {
        "type": "normal",
        "name": "区域点位",
        "point_name": "进攻方出生点",
        "icon": "icon_csd",
        "img": "smezy_gf",
        "x": "92068",
        "y": "-133741",
    },
    {
        "type": "normal",
        "name": "灭火器",
        "point_name": "灭火器",
        "icon": "icon_mhq",
        "img": "smezy_mhq1",
        "x": "97650",
        "y": "-138188",
    },
    {
        "type": "normal",
        "name": "灭火器",
        "point_name": "灭火器",
        "icon": "icon_mhq",
        "img": "smezy_mhq2",
        "x": "91723",
        "y": "-140049",
    },
    {
        "type": "role",
        "name": "露娜",
        "icon": "icon_ln",
        "points": [
            {
                "name": "B点反弹电箭",
                "point_name": "电击箭矢",
                "point_desc": "防守B点，投掷道具反弹远距离压制",
                "camp": "防守",
                "icon": "icon_djjs",
                "vid":"w12885iyscw",
                "price": "200",
                "x": "90380",
                "y":"-138877",
                "role_x": "86968",
                "role_y": "-143014"
            },
            {
                "name": "B点远距离手雷",
                "point_name": "增强型破片手雷",
                "point_desc": "防守B点，投掷道具反弹远距离压制",
                "camp": "防守",
                "icon": "icon_spzd",
                "vid":"e12881d4aeh",
                "price": "250",
               "x": "90380",
                "y":"-138877",
                "role_x": "86968",
                "role_y": "-143014"
            },
            {
                "name": "B点反弹手雷位",
                "point_name": "增强型破片手雷",
                "point_desc": "防守B点，投掷道具反弹远距离压制楼梯口敌人",
                "camp": "防守",
                "icon": "icon_spzd",
                "vid":"m1288sjehdb",
                "price": "250",
                "x": "90414",
                "y":"-141738",
                "role_x": "86934",
                "role_y": "-142566"
            },
            {
                "name": "B点反弹电箭",
                "point_name": "电击箭矢",
                "point_desc": "防守B区前厅，投掷道具反弹远距离压制",
                "camp": "防守",
                "icon": "icon_djjs",
                "vid":"i12881cepc3",
                "price": "200",
                "x": "88209",
                "y":"-139911",
                "role_x": "87313",
                "role_y": "-141842"
            },
            {
                "name": "前厅反弹雷压制步梯",
                "point_name": "增强型破片手雷",
                "point_desc": "进攻B点前厅，投掷道具反弹压制中路步梯",
                "camp": "进攻",
                "icon": "icon_spzd",
                "vid":"j1288o2xe36",
                "price": "250",
               "x": "90896",
                "y":"-140808",
                "role_x": "90380",
                "role_y": "-139360"
            },
            {
                "name": "A点压制防守闪击",
                "point_name": "电击箭矢",
                "point_desc": "防守A点，投掷道具反弹压制防守敌人闪击",
                "camp": "防守",
                "icon": "icon_djjs",
                "vid":"x1288g1s380",
                "price": "200",
                "x": "97615",
                "y":"-138463",
                "role_x": "96341",
                "role_y": "-140601"
            },
        ]
    },
    {
        "type": "role",
        "name": "牧羊人",
        "icon": "icon_myr",
        "points": [
            {
                "name": "B点反弹瞬爆雷",
                "point_name": "强化型破片手雷",
                "point_desc": "在最右侧防守B区，反弹墙投掷手雷，对墙后敌人造成伤害",
                "camp": "防守",
                "icon": "icon_spzd",
                "vid":"e12887xycm9",
                "price": "250",
                "x": "91168",
                "y":"-54564",
                "role_x": "92025",
                "role_y": "-56307"
            },
            {
                "name": "B点手雷炸煤气罐",
                "point_name": "强化型破片手雷",
                "point_desc": "在左路防守B区，反弹墙投掷手雷，引爆煤气罐，同时再向后方投掷手雷压制",
                "camp": "防守",
                "icon": "icon_spzd",
                "vid":"r1288cueiio",
                "price": "250",
                "x": "95305",
                "y":"-55450",
                "role_x": "93562",
                "role_y": "-55480"
            },
        ]
    },
    {
        "type": "role",
        "name": "液氮",
        "icon": "icon_yd",
        "points": [
            {
                "name": "A点西门冷罐高抛",
                "point_name": "杜瓦冷罐",
                "point_desc": "进攻A点左侧，远距离投掷道具压制",
                "camp": "进攻",
                "icon": "icon_dwlg",
                "vid": "r1288fz4zgh",
                "price": "300",
                "x": "95410",
                "y":"-140704",
                "role_x": "96272",
                "role_y": "-136188"
            },
            {
                "name": "A点冷罐进攻",
                "point_name": "杜瓦冷罐",
                "point_desc": "提前高抛投掷，覆盖A点二层区域或更高点来投掷覆盖到整个A点区域内",
                "camp": "进攻",
                "icon": "icon_dwlg",
                "vid": "m1288tbg1sh",
                "price": "300",
                "x": "96306",
                "y":"-142635",
                "role_x": "95100",
                "role_y": "-136464"
            }
        ]
    },
    {
        "type": "role",
        "name": "乌鲁鲁",
        "icon": "icon_wll",
        "points": [
            {
                "name": "A点西门燃烧弹高抛",
                "point_name": "复合型燃烧弹",
                "point_desc": "进攻A点左侧，远距离投掷道具压制",
                "camp": "进攻",
                "icon": "icon_fhrsd",
                "vid": "x1288t38bf2",
                "price": "300",
                "x": "95410",
                "y":"-140704",
                "role_x": "96272",
                "role_y": "-136188"
            },
            {
                "name": "A点北门燃烧弹高抛",
                "point_name": "复合型燃烧弹",
                "point_desc": "进攻A点后方，远距离投掷道具压制",
                "camp": "进攻",
                "icon": "icon_fhrsd",
                "vid": "u1288kuhqya",
                "price": "300",
                "x": "96306",
                "y":"-142635",
                "role_x": "95100",
                "role_y": "-136464"
            }
        ]
    },
];
