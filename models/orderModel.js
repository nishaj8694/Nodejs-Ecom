const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    deliveryDetails: {
        type: String,
        required: true,
    },
    user: { type: String },
    paymentMethod: { type: String },
    product: [{
        productId: {
            type: mongoose.Types.ObjectId,
            ref: "product",
            required: true

        },
        count: {
            type: Number,
            required: true
        },


    }],
    totalAmount: {
        type: Number,
    },
    exprdate:{
        type:Date},
    wallet:{type:Number},
    paid:{type:Number},

    date: { type: Date },
    status: { type: String },
    paymentId: { type: String },
},
    {
        timestamps: true
    }
);

module.exports=mongoose.model("order",orderSchema)