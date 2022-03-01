module.exports = app => {
    const express = require('express')
    //express路由
    const router = express.Router({
        mergeParams: true
    })

    //使用指定数据模型需要在此处引入
    const User = require('../../models/user.js')
    const Order = require('../../models/order.js')
    const Setting = require('../../models/setting.js')
    const DaDaSetting = require('../../models/dada_setting.js')
    const WxSetting = require('../../models/wx_setting.js')
    const FeiESetting = require('../../models/feie_setting.js')

    //有父级的数据模型需要在此处引入父级数据模型
    require('../../models/goods.js')
    require('../../models/category.js')

    //其它引入
    const jwt = require('jsonwebtoken')
    const fs = require('fs')
    const multer = require('multer')
    const upload = multer({ dest: __dirname + '/../../uploads' })
    const request = require('request')
    // const util = require('util');
    const xmlreader = require('xmlreader')
    const utils = require('../../utils/utils')
    const rpn = require('request-promise-native')

    //微信相关引入
    const wxpay = require('../../utils/wxpay')

    //达达相关引入
    const signature = require('../../utils/dada/signature')

    //定义可复用常量
    const SECRET = 'JKL20200117L00KJJ'//随便写的
    const myHTTPS = 'https://www123456789.qicp.vip'
    const notify_url = `${myHTTPS}/api/miniprogram/order/notifyrefund`
    const dada_url = 'http://newopen.qa.imdada.cn'//测试
    // const dada_url = 'http://newopen.imdada.cn'//线上
    const format = "json";
    const v = "1.0";
    // const postPromise = util.promisify(request.post);

    function nowDateTime() {
        let nowTime = new Date()
        return `${nowTime.toLocaleDateString()} ${nowTime.toLocaleTimeString()} `
    }
    //更新价格
    router.post('/update_price', async (req, res) => {
        const list = req.body
        var message = ''
        for (let i = 0; i < list.length; i++) {
            let model = await req.Model.findOneAndUpdate({
                barcode: list[i].barcode
            }, {
                price: list[i].new_price
            })
            if (!model) {
                message = + list[i].number + ','
            }
        }
        if (message.length > 0) {
            return res.send({
                type: 'error',//success/warning/info/error
                message: `价格更新完成! 错误行:` + message
            })
        }
        res.send({
            type: 'success',//success/warning/info/error
            message: `价格更新成功!`
        })
    })


    router.get('/wxmsg', async (req, res) => {
        console.log('微信通知')
        console.log(req.query.signature)
        console.log(req.query.echostr)
        var echostr = String(req.query.echostr)
        res.send(echostr)
    })
    router.post('/dadacallback', async (req, res) => {
        console.log('收到达达回调信息')
        // console.log(req.body)
        const order = await req.Model.findOne({ order_id: req.body.order_id })
        if (order) {
            if (req.body.order_status === 2 && order.status === '待接单') {
                // console.log('骑士已接单')
                var model = await Order.findOneAndUpdate({ order_id: req.body.order_id }, {
                    status: '已接单',
                    deliveryman: {
                        id: req.body.dm_id,
                        name: req.body.dm_name,
                        phone: req.body.dm_mobile
                    },//配送员信息
                    $push: { log: `${nowDateTime()}骑士已接单 姓名:${req.body.dm_name} 手机号:${req.body.dm_mobile}` }
                }, {}, function (err, data) {
                    if (err) {
                        console.log(err);
                    }
                    else if (!data) {
                        console.log("已接单-更新失败");
                    }
                    else if (data) {
                        console.log("已接单-更新成功");
                    }
                })
            } else if (req.body.order_status === 3 && order.status === '已接单') {
                // console.log('骑士已取货')
                var model = await Order.findOneAndUpdate({ order_id: req.body.order_id }, {
                    status: '配送中',
                    $push: { log: `${nowDateTime()}骑士已取货、配送中` }
                }, {}, function (err, data) {
                    if (err) {
                        console.log(err);
                    }
                    else if (!data) {
                        console.log("配送中-更新失败");
                    }
                    else if (data) {
                        console.log("配送中-更新成功");
                    }
                })
            } else if (req.body.order_status === 4 && order.status === '配送中') {
                // console.log('骑士已完成')
                var model = await Order.findOneAndUpdate({
                    order_id: req.body.order_id
                }, {
                    status: '已完成',
                    $push: { log: `${nowDateTime()}已送达` }
                }, {}, function (err, data) {
                    if (err) {
                        console.log(err);
                    }
                    else if (!data) {
                        console.log("已完成-更新失败");
                    }
                    else if (data) {
                        console.log("已完成-更新成功");
                    }
                })
            }
        } else {
            console.log("订单不存在");
        }

    })
    //已拣货
    router.get('/ready/:id', async (req, res) => {
        console.log('新增达达订单');
        const setting = await Setting.findOne()
        const dadasetting = await DaDaSetting.findOne()
        const order = await req.Model.findById(req.params.id)
        var body = JSON.stringify({
            shop_no: dadasetting.shop_no,
            origin_id: order.order_id,
            origin_mark_no: '#' + setting.store_name + '#' + order.today_no,
            city_code: "027",
            cargo_price: order.amount_real,
            is_prepay: 0,
            receiver_name: order.userDetails.userName,
            receiver_address: order.userDetails.cityName + order.userDetails.countyName + order.userDetails.detailInfo,
            receiver_lat: order.receiver_lat,
            receiver_lng: order.receiver_lng,
            receiver_phone: order.userDetails.telNumber,
            callback: `${myHTTPS}/api/admin/order/dadacallback`
        });
        var timestamp = Number(new Date());
        // console.log('body:')
        // console.log(body)
        // console.log('order:')
        // console.log(order)
        let sign = signature.dada_sign(body, format, timestamp, dadasetting.app_key, v, dadasetting.source_id, dadasetting.app_sercret)
        // console.log('sign:')
        // console.log(sign)
        request({
            url: `${dada_url}/api/order/addOrder`,
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            method: "POST",
            body: JSON.stringify({
                body: body,
                format: format,
                timestamp: timestamp,
                signature: sign,
                app_key: dadasetting.app_key,
                v: v,
                source_id: dadasetting.source_id
            })
        }, async (err, response, data) => {
            if (!err && response.statusCode == 200) {
                var jsObj = JSON.parse(data)

                if (jsObj.status == "success") {
                    console.log('新增达达订单-成功');
                    // console.log(jsObj);
                    var model = await req.Model.findByIdAndUpdate(req.params.id, {
                        status: '待接单',
                        $push: { log: `${nowDateTime()}已完成拣货-达达准备为您配送` }
                    })
                    if (!model) {
                        console.log('新增订单失败,订单不存在!');
                        return res.send({
                            type: 'error',//success/warning/info/error
                            message: `新增订单失败,订单不存在!`
                        })
                    } else {
                        console.log('新增订单-成功');
                        return res.send({
                            type: 'success',
                            message: `新增达达订单-成功`
                        })
                    }
                } else {
                    console.log('新增达达订单-失败')
                    console.log(jsObj);
                    return res.send({
                        type: 'error',
                        message: `新增达达订单-失败:${jsObj.msg}`
                    })
                }
            } else {
                console.log("err:", err)
            }
        })
        // var settings = await Setting.findOne()
        // if (settings.store_self_send) {
        //     console.log('店铺自送订单');
        //     var model = await req.Model.findByIdAndUpdate(req.params.id, {
        //         status: '配送中',
        //         current_info: '管理端确认已完成配货-商家正在配送',
        //         // take_time: (new Date()).toLocaleString('chinese', { hour12: false })
        //     })
        //     if (model) {
        //         return res.send({
        //             type: 'success',
        //             message: `商家配送订单-创建成功-请即时配送`
        //         })
        //     } else {
        //         return res.send({
        //             type: 'error',//success/warning/info/error
        //             message: `更新订单状态-失败，订单不存在!`
        //         })
        //     }
        // }else{

        // }

        // console.log('getSourceId:' + dada_config.getSourceId());
        // console.log('getHost:' + dada_config.getHost());
        // var dada_order = new dadaOrder();
        // dada_order.setShopNo();
        // console.log('getShopNo:' + dada_order.getShopNo());
        // dada_order.setShopNo('112233');
        // console.log('getShopNo:' + dada_order.getShopNo());

        // var model = await req.Model.findByIdAndUpdate(req.params.id, {
        //     status: '待接单',
        //     current_info: '管理端确认已完成配货',
        //     take_time: (new Date()).toLocaleString('chinese', { hour12: false })
        // })
        // if (!model) {
        //     return res.send({
        //         type: 'error',//success/warning/info/error
        //         message: `订单不存在!`
        //     })
        // }
        // // 已付款 待付款 已完成 已关闭
        // if (model.status == '已付款') {

        //     console.log('待取货-操作成功');
        //     return res.send({
        //         type: 'success',//success/warning/info/error
        //         message: `操作成功`
        //     })
        // } else {
        //     console.log('操作失败!,订单状态异常!')
        //     return res.send({
        //         type: 'error',//success/warning/info/error
        //         message: `操作失败!,订单状态异常!`
        //     })
        // }
    })
    //获取取消原因
    router.get('/cancel_reasons', async (req, res) => {
        var body = "";
        var timestamp = Number(new Date());
        const dadasetting = await DaDaSetting.findOne()
        // console.log('dadasetting:')
        // console.log(dadasetting)
        let sign = signature.dada_sign(body, format, timestamp, dadasetting.app_key, v, dadasetting.source_id, dadasetting.app_sercret)
        request({
            url: `${dada_url}/api/order/cancel/reasons`,
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            method: "POST",
            body: JSON.stringify({
                body: body,
                format: format,
                timestamp: timestamp,
                signature: sign,
                app_key: dadasetting.app_key,
                v: v,
                source_id: dadasetting.source_id
            })
        }, function (err, response, data) {
            if (!err && response.statusCode == 200) {
                // console.log("返回数据:", data)
                // console.log("dadasetting.app_key:", dadasetting.app_key)
                var jsObj = JSON.parse(data)
                if (jsObj.status == "success") {
                    console.log('获取取消原因-成功');
                    return res.send({
                        type: 'success',//success/warning/info/error
                        message: `获取取消原因-成功`,
                        data: jsObj.result
                    })
                } else {
                    console.log(`获取取消原因-失败:${jsObj.msg}`)
                    return res.send({
                        type: 'error',//success/warning/info/error
                        message: `获取取消原因-失败:${jsObj.msg}`
                    })
                }
            } else {
                console.log("err:", err)
                console.log("返回数据:", data)
            }
        })
    })
    //取消订单 中间件
    const authCancel = async (req, res, next) => {
        const order = await req.Model.findById(req.params.id)
        if (order.delivery_method == '外卖') {
            console.log("取消外卖订单")
            const setting = await Setting.findOne()
            if (!setting.store_self_send) {
                console.log('取消达达订单')
                var body = JSON.stringify({
                    order_id: order.order_id,
                    cancel_reason_id: req.params.cancel_reason_id
                });
                var timestamp = Number(new Date());
                const dadasetting = await DaDaSetting.findOne()
                let sign = signature.dada_sign(body, format, timestamp, dadasetting.app_key, v, dadasetting.source_id, dadasetting.app_sercret)
                let options = {
                    url: `${dada_url}/api/order/formalCancel`,
                    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                    method: "POST",
                    body: JSON.stringify({
                        body: body,
                        format: format,
                        timestamp: timestamp,
                        signature: sign,
                        app_key: dadasetting.app_key,
                        v: v,
                        source_id: dadasetting.source_id
                    })
                }
                let rpnbody = await rpn(options);
                if (rpnbody) {
                    // console.log("取消达达订单返回数据:", rpnbody)
                    var jsObj = JSON.parse(rpnbody)
                    if (jsObj.status == "success") {
                        console.log("取消达达订单-成功")
                    } else if (jsObj.code == 2011 || jsObj.code == 2076) {
                        console.log("取消达达订单失败-订单不存在")
                    } else {
                        console.log("取消达达订单-失败:", jsObj.msg)
                        return res.send({
                            type: 'error',//success/warning/info/error
                            message: jsObj.msg
                        })
                    }
                }
            }
        }
        next()
    }
    //退款 订单id
    router.get('/cancel/:id/:cancel_reason_id', authCancel, async (req, res) => {

        console.log('微信退款')
        let nonce_str = wxpay.createNonceStr() + wxpay.createTimeStamp() //随机字符串
        var order = await Order.findById(req.params.id);
        if (!order) {
            console.log("订单不存在!")
            return res.send({
                type: 'error',//success/warning/info/error
                message: `订单不存在!`
            })
        }
        let out_refund_no = order.order_id
        let order_id = order.order_id
        let total_fee = wxpay.getmoney(order.amount_real)
        let refund_fee = total_fee
        //获取微信设置
        const wxsetting = await WxSetting.findOne()
        let appid = wxsetting.appid
        let mchid = wxsetting.mchid
        let mchkey = wxsetting.mchkey
        //生成签名
        let sign = wxpay.refundsignjsapi(appid, mchid, nonce_str, notify_url, out_refund_no, order_id, refund_fee, total_fee, mchkey)
        // console.log('签名:', sign)

        var formData = "<xml>"
        formData += "<appid>" + appid + "</appid>"
        formData += "<mch_id>" + mchid + "</mch_id>"  //微信支付商户号
        formData += "<nonce_str>" + nonce_str + "</nonce_str>" //随机字符串，不长于32位。
        formData += "<notify_url>" + notify_url + "</notify_url>"
        formData += "<out_refund_no>" + out_refund_no + "</out_refund_no>"
        formData += "<out_trade_no>" + order_id + "</out_trade_no>"
        formData += "<refund_fee>" + refund_fee + "</refund_fee>"
        formData += "<total_fee>" + total_fee + "</total_fee>"
        formData += "<sign>" + sign + "</sign>"
        formData += "</xml>"
        //console.log('拼接xml数据:', formData)

        var url = 'https://api.mch.weixin.qq.com/secapi/pay/refund'

        // 退款请求
        let options = {
            url: url,
            agentOptions: {
                cert: fs.readFileSync('./cert/apiclient_cert.pem'),
                key: fs.readFileSync('./cert/apiclient_key.pem')
            },
            method: 'POST',
            body: formData
        }
        let rpnbody = await rpn(options);
        // console.log('返回数据:', rpnbody)    
        if (rpnbody) {
            xmlreader.read(rpnbody.toString("utf-8"), function (error, response) {

                if (response.xml.result_code.text() == "SUCCESS") {
                    console.log('微信退款-成功')
                } else if (response.xml.result_code.text() == 'FAIL') {
                    console.log('微信退款-异常')
                    return res.send({
                        type: 'error',//success/warning/info/error
                        message: `微信退款-异常`
                    })
                }
            })
        }
        console.log('关闭订单')
        order = await Order.findByIdAndUpdate(req.params.id, {
            status: '已关闭',
            $push: { log: `${nowDateTime()}退款成功(到账有延迟)` },
            refund_time: (new Date()).toLocaleString('chinese', { hour12: false })
        })
        if (!order) {
            console.log('订单关闭-失败!订单不存在!')
            return res.send({
                type: 'error',//success/warning/info/error
                message: `订单关闭-失败!订单不存在!`
            })
        } else {
            console.log('订单关闭-成功!')
            return res.send({
                type: 'success',//success/warning/info/error
                message: `订单关闭-成功!`
            })
        }
        console.log('调用退款函数完成')
    })
    //订单完成
    router.get('/finished/:id', async (req, res) => {
        console.log('更新订单状态-已完成')
        var order = await req.Model.findByIdAndUpdate(req.params.id, {
            status: '已完成',
            $push: { log: `${nowDateTime()}管理端确认订单已完成` },
            take_time: (new Date()).toLocaleString('chinese', { hour12: false })
        })
        if (order) {
            console.log('已完成-操作成功')
            return res.send({
                type: 'success',//success/warning/info/error
                message: `操作成功`
            })
        } else {
            console.log('已完成-操作失败-订单不存在')
            return res.send({
                type: 'error',//success/warning/info/error
                message: `订单不存在!`
            })
        }
    })
    //获取达达设置
    // router.get('/fetch', async (req, res) => {
    //     const model = await req.Model.findOne()
    //     res.send(model)
    // })
    //获取设置
    router.get('/fetch', async (req, res) => {
        const model = await req.Model.findOne()
        res.send(model)
    })
    //删除订单 已弃用
    // router.get('/remove/:id', async (req, res) => {
    //     var model = await req.Model.findByIdAndUpdate(req.params.id, {
    //         status: '已关闭',
    //         current_info: '管理端取消了此订单',
    //         // take_time: (new Date()).toLocaleString('chinese', { hour12: false })
    //     })
    //     if (!model) {
    //         return res.send({
    //             type: 'error',//success/warning/info/error
    //             message: `取消失败!订单不存在!`
    //         })
    //     }
    //     res.send({
    //         type: 'success',//success/warning/info/error
    //         message: `成功取消订单!`
    //     })
    // })
    //更新商品某项值
    router.put('/update/:id', async (req, res) => {
        // console.log(req.body.enable_sale)
        var model = await req.Model.findByIdAndUpdate(req.params.id, { enable_sale: req.body.enable_sale })
        if (!model) {
            return res.send({
                type: 'error',//success/warning/info/error
                message: `商品不存在!`
            })
        }
        res.send({
            type: 'success',//success/warning/info/error
            message: `商品更新成功!`
        })
    })
    //更新或创建设置
    router.put('/update', async (req, res) => {
        var model = await req.Model.findByIdAndUpdate(req.body._id, req.body, { new: true })
        if (!model) {
            model = await req.Model.create(req.body)
        }
        res.send(model)
    })
    //管理端搜索订单/:品名
    router.get('/goods_search/:keywords', async (req, res) => {
        var keyword = String(req.params.keywords)
        var reg = new RegExp(keyword, 'i') //不区分大小写
        var list = await req.Model.find({ name: { $regex: reg } }).populate('parent')
        res.send(list)
    })
    //管理端搜索订单/:关键词
    router.get('/order_search/:status/:keywords', async (req, res) => {
        const keyword = String(req.params.keywords)
        var reg = new RegExp(keyword, 'i') //不区分大小写
        const list = await req.Model.find({
            status: req.params.status,
            $or: [
                { order_id: { $regex: reg } },
                { "userDetails.userName": { $regex: reg } },
                { "userDetails.telNumber": { $regex: reg } },
                { "userDetails.cityName": { $regex: reg } },
                { "userDetails.countyName": { $regex: reg } },
                { "userDetails.detailInfo": { $regex: reg } }
            ]
        })
        // console.log(list)
        res.send(list)
    })
    //管理端搜索商品/:条码
    router.get('/barcode_search/:keywords', async (req, res) => {
        const model = await req.Model.findOne({ barcode: req.params.keywords })
        if (!model) {
            return res.send({
                type: 'error',//success/warning/info/error
                message: `操作失败`
            })
        }
        return res.send({
            data: model,
            type: 'success',//success/warning/info/error
            message: `操作成功`
        })
    })
    //管理端搜索商品/:品名
    router.get('/search/:keywords', async (req, res) => {
        const keyword = String(req.params.keywords)
        var reg = new RegExp(keyword, 'i') //不区分大小写
        const model = await req.Model.find({ name: { $regex: reg } })
        res.send(model)
    })
    //上传文件并返回文件地址
    app.post('/api/admin/upload', upload.single('file'), async (req, res) => {
        const file = req.file
        console.log(`/upload/${file.filename}`)
        file.url = `${myHTTPS}/uploads/${file.filename}`
        res.send(file)
    })
    //删除商品图片文件
    router.delete('/deleteImage/:name/:image_string', async (req, res) => {
        fs.unlink('./uploads/' + req.params.image_string, (err) => {
            if (err) {
                return res.send({
                    type: 'error',//success/warning/info/error
                    message: req.params.name + '删除失败！'
                })
            } else {
                return res.send({
                    type: 'success',//success/warning/info/error
                    message: req.params.name + '已删除'
                })
            }
        })
    })
    //删除文件中间件
    const authDeleteFile = async (req, res, next) => {
        if (req.Model.modelName == 'Goods' || req.Model.modelName == 'Category' || req.Model.modelName == 'Banner' || req.Model.modelName == 'Seckilling') {
            console.log("删除图片文件")
            const model = await req.Model.findById(req.params.id)
            if (model.image) {
                if (model.image !== req.body.image) {
                    const image_string = model.image.split('/')
                    fs.unlink('./uploads/' + image_string.pop(), (err) => {
                        if (err) {
                            console.log("删除文件失败:" + model.image)
                        } else {
                            console.log("删除文件成功:" + model.image)
                        }
                    })
                } else {
                    console.log("获得的url与数据库一致:" + model.image)
                }
            }
        }
        next()
    }
    router.put('/edit/:id', authDeleteFile, async (req, res) => {
        const model = await req.Model.findByIdAndUpdate(req.params.id, req.body)
        const api_description = "更新指定id的数据";
        var type = model ? 'success' : 'error';
        console.log(`${api_description}${type == 'success' ? ' 成功' : ' 失败'}`);
        return res.send({
            type: type,//success/warning/info/error
            message: `${api_description}${type == 'success' ? ' 成功' : ' 失败'}`
        })
    })
    //获取指定id的商品数据
    router.get('/edit/:id', async (req, res) => {
        const model = await req.Model.findById(req.params.id)
        res.send(model)
    })
    //删除商品数据和使用中间件删除文件
    router.delete('/delete/:id', authDeleteFile, async (req, res) => {
        const model = await req.Model.findByIdAndDelete(req.params.id, req.body)
        if (model) {
            return res.send({
                message: model.name + '已删除'
            })
        }
    })
    //获取商品列表/:需获取的数量/:需获取的数据位置
    router.get('/list_size_id/:page_size/:page', async (req, res) => {
        const page = Number(req.params.page) - 1
        const page_size = Number(req.params.page_size)
        const model = await req.Model.find().populate('parent').skip(page * page_size).limit(page_size).sort({ '_id': -1 })
        res.send(model)
    })
    //获取带参数列表,订单列表
    router.post('/list', async (req, res) => {
        var orderList;
        if (req.body.status == "已付款") {
            orderList = await req.Model.find({
                $or: [
                    { status: '已付款' },
                    { status: '待接单' },
                    { status: '已接单' }
                ]
            })
        } else if (req.body.status == "配送中") {
            orderList = await req.Model.find({ status: req.body.status })
        } else {
            orderList = await req.Model.find({ status: req.body.status })
        }
        if (orderList.length > 0 && req.body.status == "待付款") {
            for (var i = 0; i < orderList.length; i++) {
                var settings = await Setting.findOne()
                if (utils.timeFn(orderList[i].create_time) >= settings.pay_expire) {
                    const updatemodel = await Order.findByIdAndUpdate(orderList[i]._id,{
                        status : '已关闭',
                        $push: { log: `${nowDateTime()}支付超时! 订单已关闭` }
                    })
                    if (updatemodel) {
                        console.log('修改订单号:' + orderList[i].order_id + '成功\r\n')
                    }
                }
            }
            res.send({ message: 'success', orderList: orderList })
        } else if (orderList.length > 0) {
            res.send({ message: 'success', orderList: orderList })
        } else {
            res.send({ message: `没有${req.body.status}的订单!` })
        }
    })
    //获取banner列表
    router.get('/banner_list', async (req, res) => {
        const model = await req.Model.find().populate('parent_goods').populate('parent_category')
        res.send(model)
    })
    //获取各种列表
    router.get('/list', async (req, res) => {
        const model = await req.Model.find().populate('parent')
        res.send(model)
    })
    //创建
    router.post('/create', async (req, res) => {
        var model = null;
        try {
            model = await req.Model.create(req.body)
        } catch (error) {
            console.log(`${error}`);
            return res.send({
                type: 'error',//success/warning/info/error
                message: `添加数据失败，错误代码: ${error}`
            })
        }
        const api_description = "添加数据";
        var type = model ? 'success' : 'error';
        console.log(`${api_description}${type == 'success' ? ' 成功' : ' 失败'}`);
        return res.send({
            type: type,//success/warning/info/error
            message: `${api_description}${type == 'success' ? ' 成功' : ' 失败'}`
        })
    })
    //管理员注册
    router.post('/reg', async (req, res) => {
        const user = await User.findOne({
            username: req.body.username
        })
        if (user) {
            return res.send({
                message: '用户名已存在'
            })
        }
        console.log(req.body)
        const model = await User.create(req.body)
        res.send(model)
    })
    //管理员登录
    router.post('/login', async (req, res) => {
        const user = await User.findOne({
            username: req.body.username
        })
        if (!user) {
            return res.send({
                message: '账号错误'
            })
        }
        const isPasswordValid = require('bcrypt').compareSync(
            req.body.password,
            user.password
        )
        if (!isPasswordValid) {
            return res.send({
                message: '密码错误'
            })
        }
        //生成Token
        const token = jwt.sign({
            id: String(user._id),
        }, SECRET)
        res.send({
            user,
            token
        })
        // console.log("/login 请求完成")
    })
    //动态读取接口
    app.use('/api/admin/:model', async (req, res, next) => {
        const modelName = req.params.model
        if (req.url !== '/list') {
            //如果不是循环接口则显示接口信息
            console.log(`${nowDateTime()} `, req.method, modelName, req.url)
        }
        //获取接口中保函的数据模型名称
        req.Model = require(`../../models/${modelName}`)
        next()
    }, router)
}