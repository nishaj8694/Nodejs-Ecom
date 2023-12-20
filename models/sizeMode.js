const mongoose=require('mongoose');

const sizeSchema= new mongoose.Schema({
    size:{
        type:String,
        required:true
    },
    is_block:{
        type:Boolean,
        required:true
    },

})


module.exports= mongoose.model('size',sizeSchema)
