const mongoose=require('mongoose');

const brandSchema= new mongoose.Schema({
    brand:{
        type:String,
        required:true
    },
    is_block:{
        type:Boolean,
        required:true
    },

})


module.exports= mongoose.model('brand',brandSchema)
