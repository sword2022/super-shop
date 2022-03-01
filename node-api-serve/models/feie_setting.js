const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    user:{type:String},//飞鹅云 www.feieyun.cn后台注册的账号名
    ukey:{type:String},//飞鹅云后台注册账号后生成的UKEY
    printer_sn:{type:String},//打印机SN
    printer_key:{type:String},//打印机KEY
})

module.exports = mongoose.model('FeiESetting',schema)