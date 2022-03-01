const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    name:{type:String},//优惠卷名称
    mode:{type:String},//优惠方式,1：满减，2：立减
    satisfy:{type:Number},//需满足金额
    reduce:{type:Number},//优惠金额
    total:{type:Number},//优惠卷总数
    gets:{type:Number},//已领取数量
    used:{type:Number},//已使用数量
    release_start_time:{type:String},//发卷开始时间
    release_end_time:{type:String},//发卷结束时间时间
    use_start_time:{type:String},//使用开始时间
    use_end_time:{type:String},//使用结束时间
    create_time:{type:String},//创建时间
})

module.exports = mongoose.model('Coupon',schema)