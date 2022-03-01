const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    sort:{type:Number},//排序
    type:{type:Number},//商品或分类
    parent_goods:{type:mongoose.SchemaTypes.ObjectId,ref:'Goods'},//父级
    parent_category:{type:mongoose.SchemaTypes.ObjectId,ref:'Category'},//父级
    image:{type:String},//图片
})
module.exports = mongoose.model('Banner',schema)