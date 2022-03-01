const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    sort:{type:Number},//排序
    parent:{type:mongoose.SchemaTypes.ObjectId,ref:'Goods'}//父级
})

module.exports = mongoose.model('Recommend',schema)