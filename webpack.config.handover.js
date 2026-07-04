/*
 * @Author: z
 * @Date: 2017-06-05 22:06:42
 * @Last Modified by: xieshengyong
 * @Last Modified time: 2019-05-24 22:10:27
 */
const path = require('path');
const webpack = require('webpack');
const config = require('./config.path');
const fs = require('fs');

const WebpackStrip = require('webpack-strip');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');

const DefinePlugin = webpack.DefinePlugin;

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

// const handoverDir = /a20[\w]*/.exec(config.handover)[0];
const handoverDir = '';

var copyItem = [];

if (fs.existsSync('src/img/kf')) {
    copyItem.push({
        from: 'src/img/kf',
        to: './',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_db')) {
    copyItem.push({
        from: 'src/img/map_db',
        to: './img/map_db',
        flatten: true
    });
}

if (fs.existsSync('src/img/map_db')) {
    copyItem.push({
        from: 'src/img/map_db',
        to: './img/map_db',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_yc')) {
    copyItem.push({
        from: 'src/img/map_yc',
        to: './img/map_yc',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_yc2')) {
    copyItem.push({
        from: 'src/img/map_yc2',
        to: './img/map_yc2',
        flatten: true
    });
}

if (fs.existsSync('src/img/map_htjd')) {
    copyItem.push({
        from: 'src/img/map_htjd',
        to: './img/map_htjd',
        flatten: true
    });
}

if (fs.existsSync('src/img/map_bks')) {
    copyItem.push({
        from: 'src/img/map_bks',
        to: './img/map_bks',
        flatten: true
    });
}

if (fs.existsSync('src/img/map_bks2')) {
    copyItem.push({
        from: 'src/img/map_bks',
        to: './img/map_bks',
        flatten: true
    });
}

if (fs.existsSync('src/img/daba_0f')) {
    copyItem.push({
        from: 'src/img/daba_0f',
        to: './img/daba_0f',
        flatten: true
    });
}
if (fs.existsSync('src/img/daba_1f')) {
    copyItem.push({
        from: 'src/img/daba_1f',
        to: './img/daba_1f',
        flatten: true
    });
}
if (fs.existsSync('src/img/daba_2f')) {
    copyItem.push({
        from: 'src/img/daba_2f',
        to: './img/daba_2f',
        flatten: true
    });
}

if (fs.existsSync('src/img/cgxg_1f')) {
    copyItem.push({
        from: 'src/img/cgxg_1f',
        to: './img/cgxg_1f',
        flatten: true
    });
}

if (fs.existsSync('src/img/cgxg_2f')) {
    copyItem.push({
        from: 'src/img/cgxg_2f',
        to: './img/cgxg_2f',
        flatten: true
    });
}

if (fs.existsSync('src/img/bks_1f')) {
    copyItem.push({
        from: 'src/img/bks_1f',
        to: './img/bks_1f',
        flatten: true
    });
}

if (fs.existsSync('src/img/bks_2f')) {
    copyItem.push({
        from: 'src/img/bks_2f',
        to: './img/bks_2f',
        flatten: true
    });
}

if (fs.existsSync('src/img/map_htjd2')) {
    copyItem.push({
        from: 'src/img/map_htjd2',
        to: './img/map_htjd2',
        flatten: true
    });
}

if (fs.existsSync('src/img/bks_3f')) {
    copyItem.push({
        from: 'src/img/bks_3f',
        to: './img/bks_3f',
        flatten: true
    });
}

if (fs.existsSync('src/img/cxjy_1f')) {
    copyItem.push({
        from: 'src/img/cxjy_1f',
        to: './img/cxjy_1f',
        flatten: true
    });
}

if (fs.existsSync('src/img/cxjy_2f')) {
    copyItem.push({
        from: 'src/img/cxjy_2f',
        to: './img/cxjy_2f',
        flatten: true
    });
}

if (fs.existsSync('src/img/cxjy_3f')) {
    copyItem.push({
        from: 'src/img/cxjy_3f',
        to: './img/cxjy_3f',
        flatten: true
    });
}

if (fs.existsSync('src/img/cxjy_4f')) {
    copyItem.push({
        from: 'src/img/cxjy_4f',
        to: './img/cxjy_4f',
        flatten: true
    });
}


if (fs.existsSync('src/img/daba')) {
    copyItem.push({
        from: 'src/img/daba',
        to: './img/daba',
        flatten: true
    });
}

if (fs.existsSync('src/img/xdaba')) {
    copyItem.push({
        from: 'src/img/xdaba',
        to: './img/xdaba',
        flatten: true
    });
}

if (fs.existsSync('src/img/lv3')) {
    copyItem.push({
        from: 'src/img/lv3',
        to: './img/lv3',
        flatten: true
    });
}

if (fs.existsSync('src/img/dzc_i')) {
    copyItem.push({
        from: 'src/img/dzc_i',
        to: './img/dzc_i',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_gc')) {
    copyItem.push({
        from: 'src/img/map_gc',
        to: './img/map_gc',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_gc_zl')) {
    copyItem.push({
        from: 'src/img/map_gc_zl',
        to: './img/map_gc_zl',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_jq')) {
    copyItem.push({
        from: 'src/img/map_jq',
        to: './img/map_jq',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_jq_zl')) {
    copyItem.push({
        from: 'src/img/map_jq_zl',
        to: './img/map_jq_zl',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_ljd')) {
    copyItem.push({
        from: 'src/img/map_ljd',
        to: './img/map_ljd',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_pc')) {
    copyItem.push({
        from: 'src/img/map_pc',
        to: './img/map_pc',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_pc_zl')) {
    copyItem.push({
        from: 'src/img/map_pc_zl',
        to: './img/map_pc_zl',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_pc_mobile_zl')) {
    copyItem.push({
        from: 'src/img/map_pc_mobile_zl',
        to: './img/map_pc_mobile_zl',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_jq_mobile_zl')) {
    copyItem.push({
        from: 'src/img/map_jq_mobile_zl',
        to: './img/map_jq_mobile_zl',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_ljd_pc')) {
    copyItem.push({
        from: 'src/img/map_ljd_pc',
        to: './img/map_ljd_pc',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_qhz')) {
    copyItem.push({
        from: 'src/img/map_qhz',
        to: './img/map_qhz',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_qhz_mobile_zl')) {
    copyItem.push({
        from: 'src/img/map_qhz_mobile_zl',
        to: './img/map_qhz_mobile_zl',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_qhz_zl')) {
    copyItem.push({
        from: 'src/img/map_qhz_zl',
        to: './img/map_qhz_zl',
        flatten: true
    });
}
if (fs.existsSync('src/img/map_hdz')) {
    copyItem.push({
        from: 'src/img/map_hdz',
        to: './img/map_hdz',
        flatten: true
    });
}
// if (fs.existsSync('src/img/lv3')) {
//     copyItem.push({
//         from: 'src/img/lv3',
//         to: './img/lv3',
//         flatten: true
//     });
// }

module.exports = function () {
    return {
        entry: {
            main: './src/js/index.js'
        },
        output: {
            path: path.resolve(__dirname, './dist/' + handoverDir + '/ossweb-img'),
            filename: '[name].js',
            publicPath: config.handover
        },
        module: {
            rules: [
                {
                    test: /\.less$/,
                    include: [
                        path.resolve(__dirname, 'src/less')
                    ],
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    minimize: false  // css压缩，不需要时 false
                                }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {}
                            },
                            {
                                loader: 'less-loader',
                                options: {}
                            }
                        ]
                    })
                },
                {
                    test: /\.css$/,
                    include: [
                        path.resolve(__dirname, 'src/js/lib')
                    ],
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 1,
                                // name: 'css/[name].[ext]'
                                name: 'css/[name].[ext]'
                            }
                        }
                    ]
                },
                {
                    test: /\.js$/,
                    include: [
                        path.resolve(__dirname, 'src/js/lib')
                    ],
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 1,
                                name: 'js/lib/[name].[ext]'
                            }
                        }
                    ]
                },
                {
                    test: /\.js$/,
                    include: [
                        path.resolve(__dirname, 'src/js')
                    ],
                    exclude: [
                        path.resolve(__dirname, 'src/js/lib'),
                        path.resolve(__dirname, 'src/js/util')
                    ],
                    use: [
                        {
                            // loader:  WebpackStrip.loader('TD.debug(\\.\\w+)+', 'debug', 'console.log')
                            loader: WebpackStrip.loader('TD.debug(\\.\\w+)+', 'debug')
                        },
                        {
                            loader: 'babel-loader',
                            options: {}
                        },
                        {
                            loader: 'eslint-loader',
                            options: {}
                        }
                    ]
                },
                {
                    test: /\.(png|jpg|gif|svg|plist|int|ttf|TTF|otf|ico|mp3|mp4|ts|webp)$/,
                    include: [
                        path.resolve(__dirname, 'src/img')
                    ],
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 5000,
                                // name: '[name].[ext]'
                                name: '[name].[ext]'
                            }
                        }
                    ]
                },
                {
                    test: /\.(mp3|mp4)$/,
                    include: [
                        path.resolve(__dirname, 'src/media')
                    ],
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 1,
                                name: '[name].[ext]'
                            }
                        }
                    ]
                }
            ]
        },
        resolve: {
            alias: {}
        },
        plugins: [
            new CleanPlugin('dist'),
            // new ExtractTextPlugin('main.css'),
            new ExtractTextPlugin('main.css'),
            new CopyWebpackPlugin(copyItem),
            new DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('handover'),
                    'PATH': JSON.stringify(config.handover)
                }
            }),
            new HtmlWebpackPlugin({
                filename: '../index.html',
                template: 'index.ejs',
                inject: false,
                hash: false,
                minify: {
                    // removeComments: true, // 移除HTML中的注释
                    collapseWhitespace: false, // 删除空白符与换行符
                    minifyCSS: true, // 压缩 HTML 中出现的 CSS 代码
                    minifyJS: true // 压缩 HTML 中出现的 JS 代码
                }
            }),
            new HtmlWebpackPlugin({
                filename: '../m/index.html',
                template: 'index.ejs',
                inject: false,
                hash: false,
                environment: 'mobile',
                minify: {
                    // removeComments: true, // 移除HTML中的注释
                    collapseWhitespace: false, // 删除空白符与换行符
                    minifyCSS: true, // 压缩 HTML 中出现的 CSS 代码
                    minifyJS: true // 压缩 HTML 中出现的 JS 代码
                }
            })
            // new UglifyJSPlugin({
            //     uglifyOptions: {
            //         compress: {
            //             drop_console: false
            //         }
            //     }
            // })
        ],
        externals: {
            '$': 'window.$',
            'global': 'window.global'
        }
    };
};
