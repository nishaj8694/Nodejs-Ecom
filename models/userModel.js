const {default:mongoosr}=require('mongoose');
const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true

    },
    wallet:{
        type:Number,
        default:100

    },

    is_varified:{
        type:Number,
        default:0
    },
    token:{
        type:String,
        default:''
    },
    is_block:{
        type:Number,
        default:0
    },
    otp:{
        type:Number,
        default:" "
    }

})

 module.exports= mongoose.model('user',userSchema)
