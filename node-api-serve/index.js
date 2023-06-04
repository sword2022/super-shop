

const express = require('express')
const app = express()
const http = require("http");
const https = require("https");
const fs = require("fs");

//ssl证书  有花生壳https解析 可以注释掉
// var privateKey = fs.readFileSync('./ssl/xxx.com.key');
// var certificate = fs.readFileSync('./ssl/xxx.com_bundle.crt');
// var credentials = { key: privateKey, cert: certificate };

app.use(require('cors')())
app.use(express.json())
//访问uploads必须要定义静态文件托管
app.use('/uploads', express.static(__dirname + '/uploads'))

require('./plugins/db')(app)
require('./routers/admin/index')(app)
require('./routers/miniprogram/index')(app)
function nowDateTime() {
    let nowTime = new Date()
    return `${nowTime.toLocaleDateString()} ${nowTime.toLocaleTimeString()} `
}
var httpServer = http.createServer(app);
var PORT = 3000;
//监听接口
httpServer.listen(PORT, function () {
    console.log(`${nowDateTime()} HTTP Server is running on: http://localhost:%s`, PORT);
});
//监听https接口  用花生壳可以转到3000端口上
// var httpsServer = https.createServer(credentials, app);
// var SSLPORT = 443;
// httpsServer.listen(SSLPORT, function () {
//     var nowTime = new Date()
//     console.log(`${nowDateTime()} HTTPS Server is running on: https://localhost:%s`, SSLPORT)
// });

//每日自动更新团购取货日期用的定时器
const Setting = require('./models/setting.js')
async function check_pickup_date() {
    //无限循环
    for (let i = 1; i > 0; i++) {
        var settings = Setting.findOne()
        if (settings.auto_update_pickup_date) {
            //console.log(`检测是否现在更新团购取货日期 ${i}次`)
            var now = new Date()
            var nowHrs = now.getHours()
            //console.log(nowHrs)
            if (settings.update_time == nowHrs) {
                //console.log(`是设定的更新时间`)
                // 用现在日期弄出一个后天的日期
                now.setTime(now.getTime() + 2 * 24 * 60 * 60 * 1000);
                var date = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
                //console.log(`settings.pickup_date:${settings.pickup_date}`)
                //console.log(`date:${date}`)
                if (settings.pickup_date !== date) {
                    //console.log('设定团购取货日期为后天')
                    settings = await Setting.findByIdAndUpdate(settings._id, {
                        pickup_date: date
                    })
                    if (settings) {
                        console.log('设定团购取货日期-成功')
                    } else {
                        console.log('设定团购取货日期-失败')
                    }
                } else {
                    //console.log('团购取货日期是后天')
                }
            }
        }
        //异步中要用Promise调用setTimeout实现延迟
        await (() => {
            return new Promise((res) => {
                //每30秒循环1次
                setTimeout(res, 30000);
            });
        })();
    }
}

check_pickup_date();


