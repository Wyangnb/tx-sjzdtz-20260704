/*
 * @Author: xieshengyong
 * @Date: 2021-12-16 19:45:23
 * @LastEditTime: 2023-06-20 18:17:01
 * @LastEditors: xieshengyong
 */
let fs = require('fs');
let Client = require('ssh2-sftp-client');
let sftp = new Client();

const server3 = () => {
    let sftp = new Client();
    sftp.connect({
        host: '8.135.58.157',
        port: '22',
        username: 'www',
        privateKey: fs.readFileSync('../id_rsa')
    }).then(() => {
        return sftp.put('./dist/index.html', '/developmemt/sjzdtz.treedom.cn/test/index.html');
    }).then(data => {
        console.log('sftp 上传成功：', data);
    }).finally(() => {
        sftp.end();
    });
}
server3();
