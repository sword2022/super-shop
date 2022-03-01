const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    name:{type:String},
    image:{type:String},
    parent:{type:mongoose.SchemaTypes.ObjectId,ref:'Category'},//父级
})

module.exports = mongoose.model('Category',schema)