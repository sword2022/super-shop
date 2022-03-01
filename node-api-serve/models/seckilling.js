const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    sort:{type:Number},//排序
    image:{type:String},//图片
    start_time:{type:String},//秒杀开始
    end_time:{type:String},//秒杀结束
    parent:{type:mongoose.SchemaTypes.ObjectId,ref:'Goods'}//父级
})

module.exports = mongoose.model('Seckilling',schema)