const mongoose=require('mongoose');

const colorSchema= new mongoose.Schema({
    color:{
        type:String,
        required:true
    },
    is_block:{
        type:Boolean,
        required:true
    },

})


module.exports= mongoose.model('color',colorSchema)
