module.exports = app => {
    const express = require('express')
    //express路由
    const router = express.Router({
        mergeParams: true
    })

    //使用指定数据模型需要在此处引入
    const Setting = require('../../models/setting.js')
    const Categories = require('../../models/category.js')
    const Banner = require('../../models/banner.js')
    const Seckilling = require('../../models/seckilling.js')
    const Recommend = require('../../models/recommend.js')
    const Hot = require('../../models/hot.js')
    const Goods = require('../../models/goods.js')
    const WxUser = require('../../models/wx_user.js')
    const Coupon = require('../../models/coupon.js')
    const Order = require('../../models/order.js')
    const WxSetting = require('../../models/wx_setting.js')

    //微信相关引入
    const WXBizDataCrypt = require('../../utils/WXBizDataCrypt')
    var wxpay = require('../../utils/wxpay')

    //飞鹅
    var feie = require('../../utils/feie')

    //其它引入
    var request = require('request')
    var xmlreader = require('xmlreader')
    var utils = require('../../utils/utils')

    //定义可复用常量
    const myHTTPS = 'https://www123456789.qicp.vip'
    const notify_url = `${myHTTPS}/api/miniprogram/order/notifypay`
    const trade_type = 'JSAPI'

    function nowDateTime() {
        let nowTime = new Date()
        return `${nowTime.toLocaleDateString()} ${nowTime.toLocaleTimeString()} `
    }
    var time_range = function (beginTime, endTime) {
        var strb = beginTime.split(":");
        if (strb.length != 2) {
            return false;
        }

        var stre = endTime.split(":");
        if (stre.length != 2) {
            return false;
        }

        var b = new Date();
        var e = new Date();
        var n = new Date();

        b.setHours(strb[0]);
        b.setMinutes(strb[1]);
        e.setHours(stre[0]);
        e.setMinutes(stre[1]);

        if (n.getTime() - b.getTime() > 0 && n.getTime() - e.getTime() < 0) {
            return true;
        } else {
            return false;
        }
    }

    router.post('/notifypay', async (req, res) => {
        console.log('支付回调')
        let xmlPost = await wxpay.parseReqXmlData(req)//解析获取xml
        xmlreader.read(xmlPost, async (errors, response) => {
            if (null !== errors) {
                console.log(errors)
                return
            }
            if (response.xml.return_code.text() == "SUCCESS") {
                console.log('支付成功')
                var order = await Order.findOne({ order_id: response.xml.out_trade_no.text() })
                if (order) {
                    console.log('修改订单')
                    order.status = '已付款'
                    order.log.push(`${nowDateTime()} 商家正在配货`)
                    var format_time = response.xml.time_end.text()
                    console.log(`format_time:` + format_time)
                    order.pay_time = format_time.slice(0, 4)
                        + '-' + format_time.slice(4, 6)
                        + '-' + format_time.slice(6, 8)
                        + ' ' + format_time.slice(8, 10)
                        + ':' + format_time.slice(10, 12)
                        + ':' + format_time.slice(12, 14)
                    console.log('创建当日编号')
                    var nowTime = new Date()
                    var year = nowTime.getFullYear()
                    var month = pad2(nowTime.getMonth() + 1)
                    var date = pad2(nowTime.getDate())
                    var query = {
                        $and: [
                            {
                                create_time: {
                                    "$gte": new Date(`${year}-${month}-${date}T00:00:00.000Z`),
                                    "$lt": new Date(`${year}-${month}-${date}T23:59:59.999Z`)
                                }
                            },
                            {
                                $or: [
                                    { status: '已付款' },
                                    { status: '待接单' },
                                    { status: '已接单' },
                                    { status: '配送中' },
                                    { status: '已完成' }
                                ]
                            }
                        ]

                    }
                    var order_list = await Order.find(query);
                    var format = [(order_list.length + 1)].join('')
                    order.today_no = format
                    const updateorder = await Order.findByIdAndUpdate(order._id, order)
                    if (updateorder) {
                        console.log(`修改订单:${updateorder.order_id} 状态为:"已付款"\r\n`)
                    }
                    res.writeHead(200, { 'Content-Type': 'text/xml' })
                    res.end(`<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`)
                    //修改商品库存和销量
                    for (var i = 0; i < order.goods_list.length; i++) {
                        var goods = await Goods.findOne({ _id: order.goods_list[i]._id })
                        if (goods) {
                            var sales = goods.sales + order.goods_list[i].number;
                            var inventory = goods.inventory - order.goods_list[i].number;
                            var goods_updated = await Goods.findOneAndUpdate({ _id: order.goods_list[i]._id }, {
                                sales: sales,
                                inventory: inventory
                            }, { new: true })
                            if (goods_updated) {
                                console.log(`当前商品销量=${goods_updated.sales} \r\n当前商品库存=${goods_updated.inventory} \r\n`)
                            }
                            else {
                                console.log(`修改商品信息失败!\r\n`)
                            }
                        }
                    }
                    //发送订阅消息
                    getAccessToken(order);

                    //标签说明：
                    //单标签:
                    //"<BR>"为换行,"<CUT>"为切刀指令(主动切纸,仅限切刀打印机使用才有效果)
                    //"<LOGO>"为打印LOGO指令(前提是预先在机器内置LOGO图片),"<PLUGIN>"为钱箱或者外置音响指令
                    //成对标签：
                    //"<CB></CB>"为居中放大一倍,"<B></B>"为放大一倍,"<C></C>"为居中,<L></L>字体变高一倍
                    //<W></W>字体变宽一倍,"<QR></QR>"为二维码,"<BOLD></BOLD>"为字体加粗,"<RIGHT></RIGHT>"为右对齐
                    //拼凑订单内容时可参考如下格式
                    //根据打印纸张的宽度，自行调整内容的格式，可参考下面的样例格式

                    //获取店铺设置
                    const settings = await Setting.findOne()
                    if (settings.print) {
                        console.log('订单打印已启用')
                        //编辑打印内容
                        var orderInfo;
                        orderInfo = "<CB>" + settings.store_name + " " + format + "#</CB><BR>";//标题字体如需居中放大,就需要用标签套上
                        orderInfo += "名称　　　　　 单价  数量 金额<BR>";
                        orderInfo += "--------------------------------<BR>";
                        for (var i = 0; i < order.goods_list.length; i++) {
                            //保留14个字节数，中文占用两个字节
                            let str = substr(order.goods_list[i].name,14)
                            // console.log(str)
                            //获取字节数长度
                            let byteLength = str.byteLength()
                            // console.log(byteLength)
                            let space = "                "
                            //设置空白长度
                            space = space.slice(0,16 - byteLength)
                            //字符串+空白
                            let name = str + space
                            let price = (order.goods_list[i].price + '       ').slice(0, 7)
                            let number = (order.goods_list[i].number + '    ').slice(0, 4)
                            let total = parseFloat(order.goods_list[i].price * order.goods_list[i].weight * order.goods_list[i].number)
                            orderInfo += name + price + number + total + "<BR>";
                        }
                        orderInfo += "备注：" + order.remark + "<BR>";
                        orderInfo += "--------------------------------<BR>";
                        orderInfo += "商品合计：" + order.total_price + "元<BR>";
                        orderInfo += "优惠：" + order.reduce + "元<BR>";
                        orderInfo += "运费：" + order.freight + "元<BR>";
                        orderInfo += "实付：" + order.amount_real + "元<BR>";
                        orderInfo += order.userDetails ? "送货地点：" + order.userDetails.detailInfo + "<BR>" : "";
                        orderInfo += order.userDetails ? "联系电话：" + order.userDetails.telNumber + "<BR>" : "";
                        orderInfo += "下单时间：" + order.pay_time + "<BR><BR>";
                        // orderInfo += "----------请扫描二维码----------";
                        // orderInfo += "<QR>http://www.dzist.com</QR>";//把二维码字符串用标签套上即可自动生成二维码
                        //发送到飞鹅云打印机
                        feie.addprinter()
                        feie.print(orderInfo)
                    }

                } else {
                    console.log('未找到订单')
                }
            }
        })
    })
    function substr(str, len) {
        if (!str || !len) {
            return '';
        }
        // 预期计数：中文2字节，英文1字节
        var a = 0;
        // 循环计数
        var i = 0;
        // 临时字串
        var temp = '';
        for (i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 255) {
                // 按照预期计数增加2
                a += 2;
            }
            else {
                a++;
            }
            // 如果增加计数后长度大于限定长度，就直接返回临时字符串
            if (a > len) {
                return temp;

            }
            // 将当前内容加到临时字符串
            temp += str.charAt(i);
        }
        // 如果全部是单字节字符，就直接返回源字符串
        return str;
    }
    String.prototype.byteLength = function() {
        var length = 0;
        Array.from(this).map(function(char){
            if(char.charCodeAt(0)>255) {//字符编码大于255，说明是双字节字符
                length += 2;
            }else {
                length++;
            }
        });
        
        return length;
    }
    /**
     * 获取access_token
     *  @param  { string } order [订单对象]
     */
    async function getAccessToken(order) {
        console.log('getAccessToken');
        //获取微信设置
        const wxsetting = await WxSetting.findOne()
        let appid = wxsetting.appid
        let secret = wxsetting.secret
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`;
        var data = {};
        request(url, async (error, response, body) => {
            console.log('body:', body);
            if (!error && response.statusCode == 200) {
                data = JSON.parse(body)
                //查询接收新订单订阅信息的微信用户
                var wxUserList = await WxUser.find({ neworder_subscribe_message: true })
                var num = 0;
                if (wxUserList.length > 0) {
                    for (var i = 0; i < wxUserList.length; i++) {
                        sendTemplateMsg(wxUserList[i].openid, data.access_token, order);
                        num++;
                    }
                }
                console.log('订阅消息发送次数:', num);
            } else {
                console.log('getAccessToken error');
            }
        });
    }

    function setStringLength(str) {
        var len = 20;
        var retStr = ""
        for (var i = 0; i < str.length; i++) {
            if (i < len) {
                retStr += str[i]
            } else {
                break
            }
        }
        return retStr;
    }
    /**
     * 发送模板消息
     * @param  { string } openid [发送模板消息的接口需要用到openid参数]
     * @param  { string } access_token [发送模板消息的接口需要用到access_token参数]
     * @param  { string } order [订单对象]
     */
    function sendTemplateMsg(openid, access_token, order) {
        console.log('sendTemplateMsg')
        console.log('openid:' + openid)
        console.log('access_token:' + access_token)
        console.log('order_id:' + order.order_id)
        console.log('pay_time:' + order.pay_time)
        //let t = new Date();
        // let mm = (t.getMonth() + 1) < 10 ? '0' + (t.getMonth() + 1) : (t.getMonth() + 1);
        // let md = t.getDate() < 10 ? '0' + t.getDate() : t.getDate();
        // let hh = t.getHours() < 10 ? '0' + t.getHours() : t.getHours();
        // let hm = t.getMinutes() < 10 ? '0' + t.getMinutes() : t.getMinutes();
        // let hs = t.getSeconds() < 10 ? '0' + t.getSeconds() : t.getSeconds();
        // let time = t.getFullYear() + '年' + (t.getMonth() + 1) + '月' + t.getDate() + '日 ' + t.getHours() + ':' + t.getMinutes() + ':' + t.getSeconds();
        var address = order.delivery_method == "自取" ? "自取订单" : setStringLength(order.userDetails.detailInfo);
        var goods_list = "";
        for (var i = 0; i < order.goods_list.length; i++) {
            goods_list += order.goods_list[i].name + "x" + order.goods_list[i].number + " "
        }
        let goodsdetail = setStringLength(goods_list)
        const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`; //发送模板消息的接口
        const requestData = {
            touser: openid,
            template_id: "bawImZQ7WHnK50MO-xBcLYpB9Y99xdng7fpYcqzgi6U",
            page: `/pages/order-detail/index?id=${order.order_id}&accept_enable=true`,
            miniprogram_state: "trial",//跳转小程序类型:developer为开发版；trial为体验版；formal为正式版；默认为正式版
            data: {
                character_string1: {
                    value: order.order_id // 订单号
                },
                date2: {
                    value: order.pay_time // 下单时间
                },
                thing3: {
                    value: address // 地址
                },
                phone_number6: {
                    value: order.userDetails? order.userDetails.telNumber : ""// 电话
                },
                thing7: {
                    value: goodsdetail
                }
            }
        };
        console.log(requestData);
        request({ url: url, method: 'post', json: requestData }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log('模板消息推送成功:');
                console.log(body);
            } else {
                console.log("error:", error);
            }
        });
    }
    router.post('/finish', async (req, res) => {
        //查询接收新订单订阅信息的微信用户
        var wxUser = await WxUser.findOne({ openid: req.body.openid, neworder_subscribe_message: true })
        if (wxUser) {
            console.log('有接单权限');
            var order = await Order.findOne({ order_id: req.body.order_id })
            if (order.accepter == wxUser.nick_name) {
                order = await Order.findOneAndUpdate({ order_id: req.body.order_id }, { status: '已完成' }, { new: true })
                if (order) {
                    console.log(`订单:${order.order_id} 已完成操作者为:${wxUser.nick_name}\r\n`)
                    return res.send({
                        order: order,
                        message: `订单已经完成`
                    })
                }
            }
        } else {
            return res.send({
                message: `您没有接单权限!`
            })
        }
    })
    router.post('/accept', async (req, res) => {
        //查询接收新订单订阅信息的微信用户
        var wxUser = await WxUser.findOne({ openid: req.body.openid, neworder_subscribe_message: true })
        if (wxUser) {
            console.log('有接单权限');
            var order = await Order.findOne({ order_id: req.body.order_id })
            if (order.accepter) {
                console.log(`订单:${order.order_id} 已被其他人接单,接单者为:${order.accepter}\r\n`)
                return res.send({
                    order: order,
                    message: `已被其他人接单`
                })
            }
            order = await Order.findOneAndUpdate({ order_id: req.body.order_id }, { accepter: wxUser.nick_name }, { new: true })
            if (order) {
                console.log(`订单:${order.order_id} 接单者为:${wxUser.nick_name}\r\n`)
                return res.send({
                    order: order,
                    message: `您已接单，请安排拣货和配送`
                })
            }
        } else {
            return res.send({
                message: `您没有接单权限!`
            })
        }
    })
    router.post('/wxpay', async (req, res) => {

        let nonce_str = wxpay.createNonceStr() + wxpay.createTimeStamp() //随机字符串
        let timestamp = wxpay.createTimeStamp()
        var openid = req.body.openid

        let order_id = req.body.order_id
        var order = await Order.findOne({ order_id: order_id })
        if (!order) {
            return res.send({
                message: `订单不存在! 无法继续支付`
            })
        }
        if (order.status == '待付款') {
            if (!isTimeOut(order)) {
                return res.send({
                    message: `支付超时! 无法继续支付`
                })
            }
        } else {
            return res.send({
                message: `订单状态异常! 无法继续支付`
            })
        }

        let total_fee = wxpay.getmoney(order.amount_real)
        let spbill_create_ip = req.socket.remoteAddress
        //获取微信设置
        const wxsetting = await WxSetting.findOne()
        let appid = wxsetting.appid
        let mchid = wxsetting.mchid
        let mchkey = wxsetting.mchkey
        //获取店铺设置
        const settings = await Setting.findOne()
        let body_str = settings.store_name
        //生成签名sign
        let sign = wxpay.paysignjsapi(appid, body_str, mchid, nonce_str, notify_url, openid, order_id, spbill_create_ip, total_fee, trade_type, mchkey)
        // console.log('签名:', sign)

        var body = "<xml>"
        body += "<appid>" + appid + "</appid>"
        body += "<mch_id>" + mchid + "</mch_id>"  //商户号
        body += "<nonce_str>" + nonce_str + "</nonce_str>" //随机字符串，不长于32位。
        body += "<body>" + body_str + "</body>"
        body += "<notify_url>" + notify_url + "</notify_url>"
        body += "<openid>" + openid + "</openid>"
        body += "<out_trade_no>" + order_id + "</out_trade_no>"
        body += "<spbill_create_ip>" + spbill_create_ip + "</spbill_create_ip>"
        body += "<total_fee>" + total_fee + "</total_fee>"
        body += "<trade_type>" + trade_type + "</trade_type>"
        body += "<sign>" + sign + "</sign>"
        body += "</xml>"
        // console.log('拼接xml数据:', body)

        var url = 'https://api.mch.weixin.qq.com/pay/unifiedorder'
        request({ url, method: 'POST', body }, function (error, response, data) {
            if (!error && response.statusCode == 200) {
                // console.log('返回数据:', data)
                xmlreader.read(data.toString("utf-8"), function (errors, response) {
                    if (null !== errors) {
                        console.log(errors)
                        return
                    }
                    if (response.xml.return_code.text() == "FAIL") {
                        console.log(response.xml.return_msg.text())
                        return res.send({
                            message: response.xml.return_msg.text()
                        })
                    } else if (response.xml.result_code.text() == "SUCCESS") {
                        console.log('统一下单接口返回-成功')
                        var prepay_id = response.xml.prepay_id.text()
                        //将预支付订单和其他信息一起签名后返回给前端
                        let finalsign = wxpay.paysignjsapifinal(appid, nonce_str, "prepay_id=" + prepay_id, 'MD5', timestamp, mchkey)
                        return res.send({
                            timeStamp: timestamp,
                            nonceStr: nonce_str,
                            package: "prepay_id=" + prepay_id,
                            signType: "MD5",
                            paySign: finalsign
                        })
                    } else {
                        console.log('统一下单接口返回-成功')
                        return res.send({
                            message: '统一下单接口返回-成功'
                        })
                    }
                })
            }
        })
    })

    //获取用户信息
    router.get('/userinfo/:openid', async (req, res) => {
        var wx_user = await req.Model.findOne({ openid: req.params.openid })
        if (!wx_user) {
            res.send({
                message: '获取用户信息失败!'
            })
        } else {
            if (wx_user.nick_name) {
                res.send({
                    message: '获取用户信息成功',
                    wx_user: wx_user
                })
            } else {
                res.send({
                    message: '用户还未授权使用头像和昵称'
                })
            }
        }
    })
    //更新或创建用户信息
    router.put('/update', async (req, res) => {
        console.log(req.body);
        if (req.body.userInfo.openid) {
            var wx_user = await WxUser.findOneAndUpdate({ openid: req.body.userInfo.openid }, {
                nick_name: req.body.userInfo.nick_name,
                avatar: req.body.userInfo.avatar,
            }, { new: true })
            if (!wx_user) {
                wx_user = await WxUser.create(req.body.userInfo)
                if (wx_user) {
                    res.send({
                        message: '获取用户信息成功',
                        wx_user: wx_user
                    })
                } else {
                    res.send({
                        message: '获取用户信息失败!'
                    })
                }
            } else {
                res.send({
                    message: '更新用户信息成功',
                    wx_user: wx_user
                })
            }
        } else {
            res.send({
                message: '获取用户openid失败',
                wx_user: wx_user
            })
        }
    })
    //删除商品数据
    router.get('/cancel/:id', async (req, res) => {
        var order = await req.Model.findById(req.params.id)
        if (order.status == '待付款') {
            order.status = '已关闭'
            order.log.push(`${nowDateTime()} 用户取消订单`)
            const updatemodel = await Order.findByIdAndUpdate(order._id, order)
            if (updatemodel) {
                console.log('用户取消订单\r\n')
                return res.send({ type: "success", message: '操作成功! 订单已关闭' })
            } else {
                res.send({ message: '取消订单操作失败!' })
            }
        } else {
            res.send({ message: '只能取消未付款的订单' })
        }
    })
    //绑定用户微信手机号
    router.post('/encryptedData', async (req, res) => {
        console.log('req.body:', req.body)
        if (req.body.openid) {
            var wx_user = await WxUser.findOne({ openid: req.body.openid })
            if (!wx_user) {
                console.log('未获取到用户信息，请重新载入小程序后再试')
                return res.send({
                    message: '未获取到用户信息，请重新载入小程序后再试'
                })
            }
            console.log(wx_user)
            //获取微信设置
            const wxsetting = await WxSetting.findOne()
            let appid = wxsetting.appid
            var pc = new WXBizDataCrypt(appid, wx_user.session_key)
            var data = pc.decryptData(req.body.encryptedData, req.body.iv)
            // console.log('解密后 data: ', data)
            wx_user = await WxUser.findOne({ phone: data.phoneNumber })
            if (!wx_user) {
                console.log('微信手机号码绑定成功')
                wx_user = await WxUser.findOneAndUpdate({
                    openid: req.body.openid
                }, {
                    phone: data.phoneNumber
                }, { new: true })
                return res.send({
                    hasLogin: true,
                    wx_user,
                    message: '微信手机号码绑定成功'
                })
            } else {
                console.log('微信手机号码认证登录成功')
                res.send({
                    hasLogin: true,
                    wx_user,
                    message: '微信手机号码认证登录成功'
                })
            }
        } else {
            console.log('获取openid失败')
            res.send({
                message: '获取openid失败'
            })
        }
    })
    function pad2(n) { return n < 10 ? '0' + n : n }
    //检查商品价格和库存中间件
    const checkCartGoods = async (req, res, next) => {
        var cart_list = req.body.cart_list
        var localTotalPrice = 0
        for (let i = 0; i < cart_list.length; i++) {
            var model = await Goods.findOne({ _id: cart_list[i]._id })
            if (!model) {
                return res.send({
                    message: `商品${cart_list[i].name} 不存在!,请在购物车中删除`
                })
            }
            if (model.price != cart_list[i].price) {
                return res.send({
                    message: `${cart_list[i].name} 价格已变动!`
                })
            }
            if (model.inventory < cart_list[i].number) {
                return res.send({
                    message: `${cart_list[i].name} 当前库存不足!`
                })
            }
            localTotalPrice += parseFloat(cart_list[i].price * cart_list[i].weight * cart_list[i].number)
        }
        localTotalPrice = parseFloat(localTotalPrice.toFixed(2)) //js浮点计算bug，取两位小数精度
        if (req.body.cart_total != localTotalPrice) {
            console.log('req.body.cart_total:', req.body.cart_total)
            console.log('localTotalPrice:', localTotalPrice)
            return res.send({
                message: `购物车总金额异常!`
            })
        } else {
            console.log('购物车商品检测通过')
            next()
        }
    }
    // 创建订单
    router.post('/create_order', checkCartGoods, async (req, res) => {
        //console.log('创建订单检查:', req.body)

        if (req.body.delivery_method === "自取") {
            console.log('创建自取订单')
        } else {
            console.log(`创建外卖和团购订单`)
            if (!req.body.userDetails.userName) {
                return res.send({
                    message: `收货人姓名未填写!`
                })
            }
            if (!req.body.userDetails.telNumber) {
                return res.send({
                    message: `收货人电话未填写!`
                })
            }
            if (!req.body.userDetails.telNumber) {
                return res.send({
                    message: `收货人详细地址信息未填写!`
                })
            }
            if (!req.body.receiver_lat) {
                return res.send({
                    message: `请启用定位，并重新运行此小程序!`
                })
            }
        }
        var settings = await Setting.findOne()
        if (!settings.opening) {
            return res.send({
                message: `店铺休息中,暂时不能创建订单!`
            })
        }
        if (req.body.cart_total < settings.minimum_fee) {
            return res.send({
                message: `订单总价不能小于起送金额:${settings.minimum_fee}元,不能创建订单!`
            })
        }
        let reduce = 0;
        let coupon = {};
        if (req.body.coupon._id === 0) {
            console.log('未使用优惠券')
        } else {
            console.log('使用优惠券')
            var m_coupon = await Coupon.findOne({ _id: req.body.coupon._id })
            if (!m_coupon) {
                return res.send({
                    message: `此券${req.body.coupon.name} 不存在! 请点重新选择`
                })
            }
            //检查优惠券是否在当前时间内
            let st = new Date(Date.parse(m_coupon.use_start_time));
            let et = new Date(Date.parse(m_coupon.use_end_time));
            let nt = new Date();
            if (st > nt || et < nt) {
                console.log('使用的优惠券已失效')
                return res.send({
                    message: `此券${req.body.coupon.name} 已失效! 请点重新选择`
                })
            }
            coupon = m_coupon
            reduce = m_coupon.reduce
        }

        // console.log('允许创建订单')
        var nowTime = new Date()
        var year = nowTime.getFullYear()
        var month = pad2(nowTime.getMonth() + 1)
        var date = pad2(nowTime.getDate())

        var query = {
            create_time: { "$gte": new Date(`${year}-${month}-${date}T00:00:00.000Z`), "$lt": new Date(`${year}-${month}-${date}T23:59:59.999Z`) }
        }
        var order_list = await Order.find(query);
        var format = [year, month, date, ('0000' + (order_list.length + 1)).slice(-4)].join('')
        console.log('order_list.length:' + order_list.length)
        console.log('创建订单号:' + format)
        var freight = req.body.delivery_method == "自取" ? 0 : settings.freight;
        model = await Order.create({
            order_id: String(format),
            openid: req.body.openid,
            goods_list: req.body.cart_list,
            total_price: req.body.cart_total,
            coupon,
            reduce,
            freight,
            amount_real: (req.body.cart_total - reduce + freight).toFixed(2),
            status: '待付款',
            create_time: new Date(),
            userDetails: req.body.userDetails,
            receiver_lat: req.body.receiver_lat,
            receiver_lng: req.body.receiver_lng,
            remark: req.body.remark,
            delivery_method: req.body.delivery_method,
            pickup_date: settings.pickup_date,
            log: `${nowDateTime()} 订单创建成功`,
        })

        //修复订单没成功创建就能支付的BUG
        if (!model) {
            console.log('创建订单失败!')
            return res.send({
                message: `创建订单失败!`
            })
        }
        console.log('创建订单成功')
        res.send(model)
    })
    //获取设置
    router.get('/fetch', async (req, res) => {
        var model = await req.Model.find()
        res.send(model)
    })
    //过滤禁售商品
    function filter(params) {
        var objList = []
        for (var i = 0; i < params.length; i++) {
            if (params[i].parent.enable_sale) {
                objList.push(params[i])
            }
        }
        return objList
    }
    //获取index页全部内容
    router.get('/index', async (req, res) => {
        var settings = await Setting.findOne()
        if (settings == null || settings.showPopup == null || settings.store_name == null || settings.latitude == null || settings.max_distance == null) {
            console.warn('=============警告=============')
            console.warn('后台未设置完成!')
            console.warn('==============================')
            return res.send({
                message: `后台未设置完成!`
            })
        }
        var categories = await Categories.find()
        // categories.length = 48
        var banners = await Banner.find().populate('parent_goods').populate('parent_category')
        var seckillings = await Seckilling.find().populate('parent')
        seckillings = filter(seckillings)
        var recommends = await Recommend.find().populate('parent')
        recommends = filter(recommends)
        var hots = await Hot.find().populate('parent')
        hots = filter(hots)
        res.send({
            settings,
            categories,
            banners,
            seckillings,
            recommends,
            hots
        })
    })
    //App首次加载 从服务器获取OpenId
    router.post('/openid', async (req, res) => {
        var data = req.body
        // console.log(data.code)
        var APP_URL = 'https://api.weixin.qq.com/sns/jscode2session'
        if (!!data.code) {
            //获取微信设置
            const wxsetting = await WxSetting.findOne()
            let appid = wxsetting.appid
            let secret = wxsetting.secret
            request(`${APP_URL}?appid=${appid}&secret=${secret}&js_code=${data.code}&grant_type=authorization_code`, async (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    let obj = {}
                    obj = JSON.parse(body)
                    let wx_user = await WxUser.findOne({
                        openid: obj.openid
                    })
                    if (!wx_user) {
                        console.log('创建用户openid和session_key')
                        wx_user = await WxUser.create({ openid: obj.openid, session_key: obj.session_key })
                    } else {
                        console.log('更新用户session_key')
                        wx_user = await WxUser.findOneAndUpdate({ openid: obj.openid }, { session_key: obj.session_key }, { new: true })
                    }



                    let coupons = await Coupon.find()

                    // console.log('wx_user.coupons:', wx_user.coupons[0])
                    // console.log('coupons:',coupons[0])
                    //过滤用户已有的优惠券
                    // for (let i = 0; i < coupons.length; i++) {
                    //     for (let k = 0; k < wx_user.coupons.length; k++) {
                    //         if (coupons[i]._id.toString() == wx_user.coupons[k]._id.toString()) {
                    //             console.log('删除已有:', coupons[i].name)
                    //             coupons.splice(i, 1)
                    //             i--
                    //             break
                    //         }
                    //     }
                    // }

                    // //过滤已过期的券
                    // let nt = new Date();
                    // for (let i = 0; i < coupons.length; i++) {
                    //     let st = new Date(Date.parse(coupons[i].use_start_time));
                    //     let et = new Date(Date.parse(coupons[i].use_end_time));
                    //     // console.log('use_start_time:',st)
                    //     // console.log('use_end_time:',et)
                    //     if (nt < st || nt > et) {
                    //         console.log('删除已过期:', coupons[i].name)
                    //         coupons.splice(i, 1)
                    //         i--
                    //     }
                    // }
                    // 将券添加到用户券包
                    wx_user = await WxUser.findOneAndUpdate({ openid: obj.openid }, { coupons: coupons }, { new: true })

                    res.send(wx_user)
                } else {
                    console.log("error:", error);
                }
            })
        }
    })

    // 检查订单商品库存和价格
    router.post('/cart_check', checkCartGoods, async (req, res) => {
        var settings = await Setting.findOne()
        if (!settings.opening) {
            return res.send({
                message: `店铺未营业,不能创建订单!`
            })
        }
        if (settings.opening_times.length > 0) {
            var opening_times = false
            for (let i = 0; i < settings.opening_times.length; i++) {
                opening_times = time_range(settings.opening_times[i].startTime, settings.opening_times[i].endTime);
                if (opening_times) { break }
            }
            if (!opening_times) {
                return res.send({
                    message: `非营业时段,不能创建订单!`
                })
            }
        }
        if (req.body.cart_total < settings.minimum_fee) {
            return res.send({
                message: `订单总价不能小于起送金额:${settings.minimum_fee}元,不能创建订单!`
            })
        }
        console.log('允许创建订单')
        res.send({
            msg: 'success',
            freight: settings.freight,
            //优惠卷信息
        })
    })
    //获取订单详情/:id
    router.get('/order_detail/:id', async (req, res) => {
        var order_id = String(req.params.id)

        var order = await req.Model.findOne({ order_id: order_id })
        if (order.status == '待付款') {
            if (!isTimeOut(order)) {
                return
            }
        }
        var setting = await Setting.findOne()
        if (order && setting) {
            res.send({
                order,
                pickup_date: setting.pickup_date,
                pay_expire: setting.pay_expire,
                show_sales: setting.show_sales,
            })
        } else {
            res.send({
                message: '未查询到'
            })
        }
    })
    //获取商品详情/:id
    router.get('/goods_detail/:id', async (req, res) => {
        var _id = String(req.params.id)
        var model = await req.Model.findOne({ _id: _id })
        var setting = await Setting.findOne()
        if (model) {
            res.send({
                model: model,
                pickup_date: setting.pickup_date,
                pay_expire: setting.pay_expire,
                show_sales: setting.show_sales,
            })
        } else {
            res.send({
                message: '未查询到商品信息'
            })
        }
    })
    //小程序搜索商品/:商品名
    router.get('/goods_search/:keywords', async (req, res) => {
        var keyword = String(req.params.keywords)
        var reg = new RegExp(keyword, 'i') //不区分大小写
        var model = await req.Model.find({ name: { $regex: reg }, enable_sale: true }).populate('parent')
        res.send(model)
    })
    //获取商品列表 参数:分类/:需获取的数据位置/:需获取的数量
    router.post('/assign_list/:page/:page_size', async (req, res) => {
        var page = Number(req.params.page) - 1
        var page_size = Number(req.params.page_size)
        var category_list = req.body.category_list
        var goods_list = []
        for (var i = 0; i < category_list.length; i++) {
            var model = await req.Model.find({ parent: category_list[i]._id, enable_sale: true }).skip(page * page_size).limit(page_size).sort({ '_id': -1 })
            if (model) {
                goods_list = goods_list.concat(model)
            }
        }
        res.send(goods_list)
    })
    async function isTimeOut(obj) {
        var settings = await Setting.findOne()
        if (utils.timeFn(obj.create_time) >= settings.pay_expire) {
            obj.status = '已关闭'
            obj.log.push(`${nowDateTime()} 支付超时`)
            const updatemodel = await Order.findByIdAndUpdate(obj._id, obj)
            if (updatemodel) {
                console.log('修改订单号:' + obj.order_id + '成功\r\n')
            }
            return true
        }
        return false
    }
    //获取带参数列表
    router.post('/list', async (req, res) => {
        const userInfo = req.body.userInfo
        // console.log(userInfo)
        if (userInfo.openid) {
            if (req.body.status == "全部订单") {
                var reg = new RegExp(req.body.status, 'i')
                var orderList = await req.Model.find({ openid: userInfo.openid })
                if (orderList.length > 0) {
                    for (var i = 0; i < orderList.length; i++) {
                        if (orderList[i].status == '待付款') {
                            isTimeOut(orderList[i])
                        }
                    }
                    res.send({ message: 'success', orderList: orderList })
                } else {
                    res.send({ message: `没有${req.body.status}的订单!` })
                }
            } else {
                var reg = new RegExp(req.body.status, 'i')
                var orderList = await req.Model.find({ status: { $regex: reg }, openid: userInfo.openid })
                if (orderList.length > 0 && req.body.status == "待付款") {
                    for (var i = 0; i < orderList.length; i++) {
                        if (orderList[i].status == '待付款') {
                            isTimeOut(orderList[i])
                        }
                    }
                    res.send({ message: 'success', orderList: orderList })
                } else {
                    res.send({ message: `没有${req.body.status}的订单!` })
                }
            }
        } else {
            res.send({ message: `获取订单列表失败!请先绑定手机号` })
        }
    })
    //获取各种列表
    router.get('/list', async (req, res) => {
        if (req.Model.modelName == 'Goods') {
            console.log('goods/list')
        }
        var model = await req.Model.find().populate('parent')
        res.send(model)
    })
    //旧微信客户端访问提醒
    router.get('/old_client', async (req, res) => {
        res.send('您的微信版本太旧,无法正常访问小程序!')
    })

    //动态读取接口
    app.use('/api/miniprogram/:model', async (req, res, next) => {
        var modelName = req.params.model
        if (!req.url.includes('/order_detail')) {
            //如果不是循环接口则显示接口信息
            console.log(`${nowDateTime()} `, req.method, modelName, req.url)
        }
        //获取接口中保函的数据模型名称
        req.Model = require(`../../models/${modelName}`)
        next()
    }, router)
}