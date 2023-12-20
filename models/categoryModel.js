const mongoose=require('mongoose');

const CategorySchema= new mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    is_block:{
        type:Boolean,
        required:true
    },

})


module.exports= mongoose.model('category',CategorySchema)
