const mongoose=require('mongoose');

const productSchema=new mongoose.Schema({
    name:{type:String,
    required:true},
    price:{type:String,
        required:true},
    category:{type:String,
        required:true},
    description:{type:String,
        required:true},
    image:{type:String,
        required:true},
    stock:{type:String,
        required:true},
    color:{type:String,
        required:true},
    brand:{type:String,
        required:true},
    size:{type:String,
        required:true},
    is_block:{
        type:Boolean,
        required:true
    }
})
module.exports=mongoose.model('product',productSchema)