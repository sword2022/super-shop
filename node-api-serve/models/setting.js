const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    opening:{type:Boolean},//店铺营业中
    store_name:{type:String},//店铺名称
    address:{type:String},//店铺地址
    telephone:{type:String},//店铺电话
    longitude:{type:Number},//店铺经度
    latitude:{type:Number},//店铺纬度
    autoplay:{type:Boolean},//自动播放横幅广告
    interval:{type:String},//横幅广告间隔时间
    duration:{type:String},//横幅广告切换速度
    opening_times:{type:Array},//店铺营业时间段
    show_seckilling:{type:Boolean},//显示秒杀
    show_recommend:{type:Boolean},//显示推荐商品
    show_hot:{type:Boolean},//显示热卖商品
    freight:{type:Number},//设置运费
    max_distance:{type:Number},//设置最大距离
    pay_expire:{type:Number},//设置支付过期时间
    minimum_fee:{type:Number},//最低消费
    show_sales:{type:Boolean},//显示已售
    self_pickup_method:{type:Boolean},//自取
    takeout_method:{type:Boolean},//外卖
    groupon_method:{type:Boolean},//团购
    store_self_send:{type:Boolean},// 商家自送
    showPopup:{type:Boolean},//显示弹出层
    pickup_date:{type:String},//团购送货时间
    auto_update_pickup_date:{type:Boolean},//启用自动更新团购送货日期
    update_time:{type:Number},//团购送货日期更新时间
    print:{type:Boolean},//是否打印
})

module.exports = mongoose.model('Setting',schema)