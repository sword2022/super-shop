var crypto = require('crypto')

var wxpay = {
    // 解析通过post传递过来的xml信息
    parseReqXmlData: function (req) {
        let notionData = "";
        req.setEncoding('utf8');
        req.on('data', (chunk) => {
            notionData += chunk;
        });
        return new Promise((resolve, reject) => {
            req.on("end", () => {
                resolve(notionData)
            });
            req.on("error", (e) => {
                reject(e)
            })
        })
    },
    //把金额转为整数分
    getmoney: function (money) {
        return (Math.round(money * 100, 0)).toString();
    },

    // 随机字符串产生函数  
    createNonceStr: function () {
        return Math.random().toString(36).substr(2, 15);
    },

    // 时间戳产生函数  
    createTimeStamp: function () {
        return parseInt(new Date().getTime() / 1000) + '';
    },

    //退款签名加密算法
    refundsignjsapi: function (appid, mch_id, nonce_str, notify_url, out_refund_no, out_trade_no, refund_fee, total_fee, key) {
        var ret = {
            appid: appid,
            mch_id: mch_id,
            nonce_str: nonce_str,
            notify_url: notify_url,
            out_refund_no: out_refund_no,
            out_trade_no: out_trade_no,
            refund_fee: refund_fee,
            total_fee: total_fee
        };
        var string = raw(ret);
        string = string + '&key=' + key;
        var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
        return sign.toUpperCase()
    },

    //支付签名加密算法
    paysignjsapi: function (appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type, key) {
        var ret = {
            appid: appid,
            body: body,
            mch_id: mch_id,
            nonce_str: nonce_str,
            notify_url: notify_url,
            openid: openid,
            out_trade_no: out_trade_no,
            spbill_create_ip: spbill_create_ip,
            total_fee: total_fee,
            trade_type: trade_type
        };
        var string = raw(ret);
        string = string + '&key=' + key;
        // console.log('string:', string)
        var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
        return sign.toUpperCase()
    },

    //支付签名加密算法,第二次的签名
    paysignjsapifinal: function (appid, nonceStr, package, signType, timeStamp, key) {
        var ret = {
            appId: appid,
            nonceStr: nonceStr,
            package: package,
            signType: signType,
            timeStamp: timeStamp
        };
        var string = raw(ret);
        string = string + '&key=' + key;
        var crypto = require('crypto');
        return crypto.createHash('md5').update(string, 'utf8').digest('hex');
    }
}

function raw(args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key] = args[key];
    });
    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}

module.exports = wxpay;