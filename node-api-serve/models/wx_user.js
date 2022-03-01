const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    phone:{type:String},
    openid:{type:String},
    session_key:{type:String},
    nick_name:{type:String},
    avatar:{type:String},
    coupons:{type:Array},
    neworder_subscribe_message:{type:Boolean},//新订单订阅消息
})
module.exports=mongoose.model('WxUser',schema)