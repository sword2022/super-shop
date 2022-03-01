const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    // 达达商户信息
    source_id:{type:String},//达达商户SourceID
    shop_no:{type:String},//门店编号
    //达达开发者信息
    app_key:{type:String},
    app_sercret:{type:String},
})

module.exports = mongoose.model('DaDaSetting',schema)