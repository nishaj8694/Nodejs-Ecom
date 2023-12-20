const { createRequire } = require('module')
const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const { log } = require('console')
const category = require('../models/categoryModel');
const products = require('../models/productModel');
const order = require('../models/orderModel');
const cart = require('../models/cartModel');
const Razorpay= require('razorpay')


const dotenv=require('dotenv')
dotenv.config()

// var instance= new Razorpay({
//   key_id:process.env.key_id,
//   key_secret:process.env.key_secret
// });


//place the order




const placeOrder = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.session.email });
        const session=req.session.email
        const total = await cart.aggregate([
            { $match: { userId: userData.email } },
            { $unwind: "$products" },
            {
              $project: {
                productPrice: "$products.productPrice",
                count: "$products.count",
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: { $multiply: ["$productPrice", "$count"] },
                },
              },
            },
        ]);

        const Total = total.length > 0 ? total[0].total : 0;

//////
        const userWalletAmount = userData.wallet
        let paidAmount;
        let walletAmountUsed
        let walletAmountBalance

        if (userWalletAmount < Total) {
          paidAmount = req.body.amount
          walletAmountUsed = Total - paidAmount
          walletAmountBalance = userWalletAmount - walletAmountUsed        
      } else {
          paidAmount = 0
          walletAmountUsed = Total
          walletAmountBalance = userWalletAmount - Total
      }
       await User.findOneAndUpdate({ email: req.session.email }, { $set: { wallet: walletAmountBalance } })
       
       
    
        

        let payment = req.body.payment;
        const address=req.body.address
        if(payment===undefined){
          payment='wallet'
        }
        
        const cartData = await cart.findOne({ userId: req.session.email });
        
        const products = cartData.products;
        const exprdate = new Date(Date.now() +(14 * 24 * 60 * 60 * 1000))

        
        if(payment!="online"){
          status="placed"
        }else{
          status="pending"
        }

        const newOrder = new order({
            deliveryDetails:address,
            user: userData.name,
            paymentMethod: payment,
            wallet: walletAmountUsed,
            paid: paidAmount,
            product: products,
            exprdate:exprdate,
            totalAmount: Total,
            date: Date.now(),
            status: status

            
        });

        const saveOrder=await newOrder.save();
        

        if(status === "placed") {
          
            await cart.deleteOne({ userId: userData.email });
            res.json({success:true})
            
           
        } else {
         
          const orderid=saveOrder._id
            const totalamount=saveOrder.paid
            var options={
                    amount: totalamount*100,
                    currency: "INR",
                    receipt: ""+orderid
            }
            instance.orders.create(options,function(err,order){
                res.json({order});
                
            })

            
        }
    } catch (error) {
        console.log(error.message);
    }
}



const orderplaced =async (req,res)=>{
  try {

      const userData=await User.findOne({email:req.session.email})
      const session=req.session.email


      res.render('success',{session,userData})

    
      
  } catch (error) {
      console.log(error.message);
      
  }   
}



///verifyOnlinePayment

const verifyOnlinePayment =async(req,res)=>{
  try {
      

     
      const details= (req.body)
     
      const crypto = require('crypto');
      let hmac = crypto.createHmac('sha256',process.env.key_secret);
      hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)  
          
      hmac = hmac.digest('hex');
      

      // console.log(details.payment.razorpay_signature);
      
      if (hmac == details.payment.razorpay_signature) {

        

          await order.findByIdAndUpdate({_id:details.order.receipt},{$set:{status:"placed"}});
          await order.findByIdAndUpdate({_id:details.order.receipt},{$set:{paymentId:details.payment.razorpay_payment_id}});
          await cart.deleteOne({userId:req.session.email});
          res.json({success:true});
      }else{
          await order.findByIdAndRemove({_id:details.order.receipt});
          res.json({success:false});
      }
      

  } catch (error) {
      console.log(error.message);
      
  }
}



//to cancel order
const   cancelOrder=async(req,res)=>{
  try {
      const id=req.query.id;
      const userdata=await User.findOne({email:req.session.email})
      const orderData=await order.findOne({_id:id});
      
      
      if(orderData.status==="placed"){
          await order.updateOne({_id:id},{$set:{status:"cancelled"}})
          res.redirect('/myorder')
      }

      if(orderData.paymentMethod==="online"){
        await User.updateOne({email:req.session.email},{$inc:{wallet:orderData.totalAmount}})

      }
      
  } catch (error) {
      console.log(error.message);
      
  }
}



//to return order

const returnOrder=async(req,res)=>{

  try {
    const id=req.query.id;
      const orderData=await order.findOne({_id:id});

      if(Date.now()>orderData.exprdate){

        res.render('404')

    }else{
        await order.updateOne({_id:id},{$set:{status:"pending"}})

        res.redirect('/myorder')
    }
      
      
      
    
  } catch (error) {
    console.log(error.message)
  }
}

module.exports={placeOrder,
  cancelOrder,
  orderplaced,
  verifyOnlinePayment,
  returnOrder,
 

}