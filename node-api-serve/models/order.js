const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    order_id:{type:String},//订单ID
    openid:{type:String},//订单创建者的openid
    goods_list:{type:Array},//商品对象数组
    coupon:{type:Object},//优惠卷对象
    reduce:{type:Number},//优惠金额
    freight:{type:Number},//运费
    pay_type:{type:String},//支付方式
    total_price:{type:Number},//商品总金额
    amount_real:{type:Number},//实际金额
    goods_weight:{type:Number},//货物重量
    receiver_lng:{type:Number},//收货人经度
    receiver_lat:{type:Number},//收货人纬度
    remark:{type:String},//备注
    status:{type:String},//状态 待付款->已付款->待接单->已接单->配送中->已完成||已关闭
    create_time:{type: Date},//创建时间
    pay_time:{type:String},//付款时间
    send_time:{type:String},//发货时间
    take_time:{type:String},//收货时间
    pickup_date:{type:String},//团购取货日期
    refund_time:{type:String},//退款时间
    delivery_method:{type:String},//交货方式 自取/外卖/团购
    accepter:{type:String},//接单员
    deliveryman:{type:Object},//配送员
    log:{type:Array},//日志
    userDetails:{type:Object},//用户信息{userName,telNumber,countyName,cityName,detailInfo,}
    today_no:{type:Number},//当日编号
})

module.exports = mongoose.model('Order',schema)