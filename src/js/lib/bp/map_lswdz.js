var lswdzInfo = {
    width: 7565.885254,
    height: 7565.885254,
    boundsW: -256,
    boundsH: 256,
    // 蓝水屋电站使用自己的世界坐标中心，不能沿用航天基地的中心坐标。
    centerX: 97132.992188,
    centerY: 53532.332031,
    minZoom: 1,
    initZoom: 1,
    maxZoom: 3,
    bj: 128,
    initX: -105,
    initY: 120
};

// 点位由菜单按需传入地图，不会在进入模式时自动显示。
var selectRegion_lswdz = [
    {
        name: '阿萨拉 基地',
        x: "95140",
        y: "-48364",
    },
    {
        name: '阿萨拉 调度室',
        x: "98364",
        y: "-49536",
    },
    {
        name: 'A区 抽水设施',
        x: "99720",
        y: "-50192",
    },
    {
        name: '阿萨拉 备用发电室',
        x: "92756",
        y: "-48056",
    },
    {
        name: 'B区 快速通道',
        x: "94840",
        y: "-49881",
    },
    {
        name: 'B区 杂物房',
        x: "91120",
        y: "-50992",
    },
    {
        name: 'B区 通道',
        x: "92640",
        y: "-49368",
    },
    {
        name: 'B 滑索平台',
        x: "94880",
        y: "-52449",
    },
    {
        name: 'A 滑索平台',
        x: "99364",
        y: "-52920",
    },
    {
        name: '滑索',
        x: "96964",
        y: "-52916",
    },
    {
        name: 'B区 检修通道',
        x: "94472.953125",
        y: "-54185.066406",
    },
    {
        name: 'B区 分拣广场',
        x: "92296",
        y: "-52164",
    },
    {
        name: 'B区 运输一通',
        x: "90980",
        y: "-53756",
    },
    {
     name: 'B区 运输二通',
     x: "92720",
     y: "-55480",
 },
 {
     name: 'B区 运输三通',
     x: "91996",
     y: "-57064",
 },
 {
     name: 'B 目标点',
     x: "93168",
     y: "-57120",
 },
 {
     name: 'B区 杂货堆',
     x: "92772",
     y: "-58804",
 },
 {
     name: '哈夫克 泄洪口',
     x: "97080",
     y: "-58872",
 },
 {
     name: 'B区 二楼',
     x: "95096",
     y: "-58328",
 },
 {
     name: 'A区 检修区',
     x: "100072",
     y: "-58684",
 },
 {
     name: 'A区 闸房',
     x: "99372.000000",
     y: "-56924.000000",
 },
 {
     name: 'A目标点',
     x: "101452.000000",
     y: "-55708.000000",
 },
 {
     name: 'A区 大门',
     x: "103824.000000",
     y: "-55412.000000",
 },
 {
     name: 'A区 货场',
     x: "102472.046875",
     y: "-53051.589844",
 },
 {
     name: 'A大 分岔路',
     x: "100596.046875",
     y: "-52699.589844",
 },
 {
     name: 'A区 侧路',
     x: "99364.046875",
     y: "-55363.589844",
 },
 {
     name: 'B区 检修室',
     x: "94939.070312",
     y: "-56538.269531",
 },
 {
     name: '哈夫克 检修管道',
     x: "96827.070312",
     y: "-57010.269531",
 }
];

// 进入模式时默认显示的区域。
var selectPoint_lswdz = [
    {
        "type": "normal",
        "name": "区域点位",
        "point_name": "A点",
        "icon": "icon_csd",
        "img": "lswdz_a",
        "x": "101319",
        "y": "-55142",
    },
    {
        "type": "normal",
        "name": "区域点位",
        "point_name": "B点",
        "icon": "icon_csd",
        "img": "lswdz_b",
        "x": "94059",
        "y": "-56665",
    },
    {
        "type": "normal",
        "name": "区域点位",
        "point_name": "中路滑索",
        "icon": "icon_csd",
        "img": "lswdz_hs",
        "x": "97015",
        "y": "-52675",
    },
    {
        "type": "normal",
        "name": "区域点位",
        "point_name": "管道",
        "icon": "icon_csd",
        "img": "lswdz_gd",
        "x": "96305",
        "y": "-57079",
    },
    {
        "type": "normal",
        "name": "区域点位",
        "point_name": "防守方出生点",
        "icon": "icon_csd",
        "img": "lswdz_ff",
        "x": "97222",
        "y": "-59561",
    },
    {
        "type": "normal",
        "name": "区域点位",
        "point_name": "进攻方出生点",
        "icon": "icon_csd",
        "img": "lswdz_gf",
        "x": "95242",
        "y": "-48065",
    },
    {
        "type": "normal",
        "name": "灭火器",
        "point_name": "灭火器",
        "icon": "icon_mhq",
        "img": "lswdz_mhq1",
        "x": "91009",
        "y": "-54569",
    },
    {
        "type": "normal",
        "name": "煤气罐",
        "point_name": "煤气罐",
        "icon": "icon_mqg",
        "img": "lswdz_mqg",
        "x": "100680",
        "y": "-56281",
    },
    {
        "type": "normal",
        "name": "灭火器",
        "point_name": "灭火器",
        "icon": "icon_mhq",
        "img": "lswdz_mhq2",
        "x": "102267",
        "y": "-53263",
    },
    {
        "type": "role",
        "name": "乌鲁鲁",
        "icon": "icon_wll",
        "points": [
            {
                "name": "A点燃烧弹压制",
                "point_name": "复合型燃烧弹",
                "point_desc": "防守压制A点路口",
                "camp": "防守",
                "icon": "icon_fhrsd",
                "vid": "e1288hff2hw",
                "price": "300",
                "x": "100687",
                "y":"-51669",
                "role_x": "100716",
                "role_y": "-56486"
            },
            {
                "name": "A点燃烧弹进攻",
                "point_name": "复合型燃烧弹",
                "point_desc": "提前高抛投掷，覆盖A点二层区域或更高点来投掷覆盖到整个A点区域内",
                "camp": "进攻",
                "icon": "icon_fhrsd",
                "vid": "q1288b7lwfl",
                "price": "300",
                "x": "100834",
                "y":"-57136",
                "role_x": "104174",
                "role_y": "-53708"
            },
            {
                "name": "A点燃烧弹压制",
                "point_name": "复合型燃烧弹",
                "point_desc": "进攻A点，提前高抛投掷，防止防守方架点",
                "camp": "进攻",
                "icon": "icon_fhrsd",
                "vid": "e1288bnkjzr",
                "price": "300",
                "x": "103790",
                "y":"-54979",
                "role_x": "100746",
                "role_y": "-52023"
            },
            {
                "name": "B区高抛燃烧弹",
                "point_name": "复合型燃烧弹",
                "point_desc": "进攻B点，提前高抛投掷，防止防守方架点",
                "camp": "进攻",
                "icon": "icon_fhrsd",
                "vid": "v12889y6adn",
                "price": "300",
                "x": "91966",
                "y":"-56307",
                "role_x": "90784",
                "role_y": "-52968"
            },
        ]
    },
    {
        "type": "role",
        "name": "液氮",
        "icon": "icon_yd",
        "points": [
            {
                "name": "A点冷罐压制",
                "point_name": "杜瓦冷罐",
                "point_desc": "集装箱上投掷，压制B点防守方闪击",
                "camp": "防守",
                "icon": "icon_dwlg",
                "vid": "s1288pu6dxc",
                "price": "300",
                "x": "100687",
                "y":"-51669",
                "role_x": "100716",
                "role_y": "-56486"
            },
            {
                "name": "A点冷罐进攻",
                "point_name": "杜瓦冷罐",
                "point_desc": "提前高抛投掷，覆盖A点二层区域或更高点来投掷覆盖到整个A点区域内",
                "camp": "进攻",
                "icon": "icon_dwlg",
                "vid": "m1288tbg1sh",
                "price": "300",
                "x": "100834",
                "y":"-57136",
                "role_x": "104174",
                "role_y": "-53708"
            },
            {
                "name": "A点冷罐压制",
                "point_name": "杜瓦冷罐",
                "point_desc": "进攻A点，提前高抛投掷，防止防守方架点",
                "camp": "进攻",
                "icon": "icon_dwlg",
                "vid": "k12885s6d9a",
                "price": "300",
                "x": "103790",
                "y":"-54979",
                "role_x": "100746",
                "role_y": "-52023"
            },
            {
                "name": "B区高抛冷罐",
                "point_name": "杜瓦冷罐",
                "point_desc": "进攻B点，提前高抛投掷，防止防守方架点",
                "camp": "进攻",
                "icon": "icon_dwlg",
                "vid": "k12885s6d9a",
                "price": "300",
                "x": "92054",
                "y":"-56366",
                "role_x": "91552",
                "role_y": "-52406"
            },
        ]
    },
    {
        "type": "role",
        "name": "红狼",
        "icon": "icon_hl",
        "points": [
            {
                "name": "A点烟雾干扰",
                "point_name": "突破型烟雾弹",
                "point_desc": "提前高抛投掷烟雾，干扰A点二层区域或更高点来投掷到A点区域内",
                "camp": "进攻",
                "icon": "icon_ywd",
                "vid": "i1288tnqzmx",
                "price": "150",
                "x": "100834",
                "y":"-57136",
                "role_x": "104174",
                "role_y": "-53708"
            }
        ]
    },
    {
        "type": "role",
        "name": "佐娅",
        "icon": "icon_zy",
        "points": [
            {
                "name": "A点毒雾干扰",
                "point_name": "致盲毒雾",
                "point_desc": "提前高抛投掷毒雾，干扰A点二层区域或更高点来投掷到A点区域内",
                "camp": "进攻",
                "icon": "icon_zmdw",
                "vid": "a1288kqrj9j",
                "price": "250",
                "x": "100834",
                "y":"-57136",
                "role_x": "104174",
                "role_y": "-53708"
            }
        ]
    },
    {
        "type": "role",
        "name": "露娜",
        "icon": "icon_ln",
        "points": [
            {
                "name": "B点反弹瞬爆雷",
                "point_name": "增强型破片手雷",
                "point_desc": "在最右侧防守B区，反弹墙投掷手雷，对墙后敌人造成伤害",
                "camp": "防守",
                "icon": "icon_spzd",
                "vid":"v1288swk346",
                "price": "250",
                "x": "91168",
                "y":"-54564",
                "role_x": "92025",
                "role_y": "-56307"
            },
            {
                "name": "B点手雷炸煤气罐",
                "point_name": "增强型破片手雷",
                "point_desc": "在左路防守B区，反弹墙投掷手雷，引爆煤气罐，同时再向后方投掷手雷压制",
                "camp": "防守",
                "icon": "icon_spzd",
                "vid":"y1288jyo5nc",
                "price": "250",
                "x": "91168",
                "y":"-54564",
                "role_x": "92025",
                "role_y": "-56307"
            },
            {
                "name": "B点通道远程手雷",
                "point_name": "增强型破片手雷",
                "point_desc": "防守检修通道，远距离精准投掷手雷压制",
                "camp": "防守",
                "icon": "icon_spzd",
                "vid":"e12880bt45u",
                "price": "250",
                "x": "91168",
                "y":"-54564",
                "role_x": "92025",
                "role_y": "-56307"
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
];
