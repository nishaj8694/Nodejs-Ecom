const mongoose = require('mongoose');

const useraddresSchema = new mongoose.Schema({
    user: {
        type:String,
        ref:"user",
        required: true,

    },
    address: [{
        name: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },

        mobile: {
            type: Number,
            required: true
        },
        
       
        pin: {
            type: String,
            required: true
        },

        country: {
            type: String,
            required: true
        },
    }]

})

module.exports=mongoose.model('user_address',useraddresSchema)
