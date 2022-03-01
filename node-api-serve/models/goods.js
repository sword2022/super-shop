const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    name:{type:String},//商品名
    barcode:{type:Number},//条码
    detail:{type:String},//详情
    weight:{type:Number},//重量
    price:{type:Number},//价格
    line_price:{type:Number},//价格
    inventory:{type:Number},//库存
    image:{type:String},//主图片
    sales:{type:Number},//销量
    score:{type:Number},//评分
    parent:{type:mongoose.SchemaTypes.ObjectId,ref:'Category'},//父级
    enable_sale:{type:Boolean},//允许销售
    images:{type:Array},//图片组
})

module.exports = mongoose.model('Goods',schema)