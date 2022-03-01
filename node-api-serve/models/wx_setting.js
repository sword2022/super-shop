const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    // 微信小程序
    appid:{type:String},
    secret:{type:String},
    //微信商户信息
    mchid:{type:String},
    mchkey:{type:String},
})

module.exports = mongoose.model('WxSetting',schema)