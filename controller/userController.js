const { log }= require('console');
const User = require('../models/userModel');
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const Randomstring = require('randomstring');
const product = require('../models/productModel')
const cart = require('../models/cartModel')
const user_address = require('../models/addressmodel')
const order=require('../models/orderModel')
const Razorpay= require('razorpay')
const addressData=require('../models/addressmodel')
const category = require('../models/categoryModel')
const brand=require('../models/brandModel')
const size=require('../models/sizeMode')
const color= require ('../models/colorModel')
const wishlist=require('../models/wishlist')
const dotenv=require('dotenv')
dotenv.config()



//pdf coverter requirements
// const ejs = require('ejs');
// const pdf = require('html-pdf');
// const fs = require('fs');
// const path = require('path');


// var instance= new Razorpay({
//   // key_id:process.env.key_id,
//   // key_secret:process.env.key_secret
//   key_id:'rzp_test_zXedqyyI6ertFX',
//   key_secret:'clQD3a8HDR74p9JQfqJ42Dh8'
// });




const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
}




// Import necessary modules

const randomstring = require('randomstring');
const { logout } = require("./adminController");
const { triggerAsyncId } = require("async_hooks");
const { isNumberObject } = require("util/types");


// Function to send verification email with OTP
const sendverifyMail = async (name, email, user_id) => {
  registerTymEmail = email
  try {

    // Create nodemailer transporter object
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.user,
        pass:process.env.pass
      },
    });

    // Generate random OTP
    otp = Randomstring.generate({
      length: 6,
      charset: 'numeric',
    });

    // Compose email message
    const mailOptions = {
      from: 'jtpjishnu@gmail.com', // Enter your Gmail address
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is ${otp}.`,
      html: `<p>Hello ${name},</p>
             <p>Please use the following OTP to verify your email address:</p>
             <h2>${otp}</h2>
             <p>Alternatively, you can click on the following link to verify your email address:</p>
             <p><a href="http://localhost:3000/verify?id=${user_id}"></a></p>
             <p>Thank you for using our service.</p>`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
   

    // Return the OTP for verification
    return otp;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};




//reset mail snd
// Function to send verification email with OTP
const sendResetPasswordMail = async (name, email, token) => {
  registerTymEmail = email
  try {

    // Create nodemailer transporter object
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.user, // Enter Gmail address
        pass: process.env.pass, // Enter  Gmail password
      },
    });


    // Compose email message
    const mailOptions = {
      from: 'jtpjishnu@gmail.com', // Enter  Gmail address
      to: email,
      subject: 'For Reset Password',
      html: `<p>Hello ${name},</p>
             <p>reset password:</p>
             <p>res</p>
             <p><a href="http://localhost:3000/verify?token=${token}">Reset</a> Your Password</p>
             <p>Thank you for using our service.</p>`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
  

    // Return the OTP for verification
    return otp;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};


// To load URL : /home
const loadHome = async function (req, res) {
  const session = req.session.email
  const userData = await User.findOne({ email: session })
  const productData = await product.find();
  try {
    if (session) {
      const customer = true
      res.render('home', { userData, session, productData })

    }
    else {
      res.render("home", { userData, session, productData })
    }

  } catch (error) {
    console.log(error);
  }

}
//To load  login page
const loadLogin = async function (req, res) {
  try {
    const session=req.session.email

    res.render('login',{session})
  } catch (error) {
    console.log(error);
  }
}


//load products page
const loadProducts = async (req, res) => {
  try {
    
    const session = req.session.email
    const userData = await User.findOne({ email: session })
    // let productData = await product.find()
    const categories=await category.find()
    // const brandData= await brand.find()
    const page = Number(req.query.page) || 1
    const limit =6
    const skip = (page - 1) * limit

    let price = req.query.value 
    let Category = req.query.category || "All"
    let Search = req.query.search || ""
    let Brand= req.query.brand||"All"
    let Size=req.query.size||"All"
    let Color=req.query.color||"All"

    
   
    Search = Search.trim()

    const categoryData = await category.find({is_block : false},{category : 1, _id :0})
    let cat = []
    for(i = 0; i < categoryData.length ; i++){
        cat[i] = categoryData[i].category
    }

    const brandData= await brand.find({is_block : false},{brand : 1, _id :0})
    let bran = []
    for(i = 0; i < brandData.length ; i++){
        bran[i] = brandData[i].brand
    }

    const sizeData= await size.find({is_block : false},{size : 1, _id :0})
    let siz = []
    for(i = 0; i < sizeData.length ; i++){
        siz[i] = sizeData[i].size
    }

    const colorData= await color.find({is_block : false},{color : 1, _id :0})
    let col = []
    for(i = 0; i < colorData.length ; i++){
        col[i] = colorData[i].color
    }

    let sort;
    Category === "All" ? Category = [...cat] : Category = req.query.category.split(',')
    price === "High" ? sort = -1 : sort = 1

    let brands;
    Brand === "All" ? brands = [...bran] : brands = req.query.brand.split(',')

    let sizes;
    Size === "All" ? sizes = [...siz] : sizes = req.query.size.split(',')

    let colors;
    Color === "All" ? colors = [...col] : colors = req.query.color.split(',')

    

    let productData = await product.aggregate([
      {
        $match: {
          name: { $regex: Search, $options: "i" },
          category: { $in: Category },
          brand: { $in: brands },
          size: { $in: sizes },
          color: { $in: colors }
        }
      },
      ...(price === "High" || price === "Low"
        ? [
            {
              $sort: {
                price: price === "High" ? -1 : 1
              }
            }
          ]
        : []),
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);
 
    
    
    const productCount = (await product.find({name : {$regex : Search, $options :'i'}}).where("category").in([...Category])).length
                
    const totalPage = Math.ceil(productCount / limit)

    res.render('products',{session,userData,categoryData,productData,price,Category,brandData,Search,sizeData,Size,Brand,page,totalPage,colorData,Color})

  } catch (error) {
    console.log(error);
  }

}



//To load register page
const loadRegister = async function (req, res) {
  try {
    res.render('register')
  } catch (error) {
    console.log(error)
  }
}

//insert user details to db

const insertUser = async (req, res) => {
  try {
    const sPassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      password: sPassword,
      is_admin: 0,
    });

    const existEmail = await User.findOne({ email: req.body.email });
    if (existEmail) {
      res.render("register", { message: "Email Already Exist" });
    } else {
      const userData = await user.save();
      if (userData) {

        sendverifyMail(req.body.name, req.body.email, userData._id);

        res.render('otpVerification');

      } else {
        res.render("register", { message: "Registration Failed" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//verify login

const verifyLogin = async (req,res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      if (userData.is_varified === 1 && userData.is_block === 0) {

        //compare password user entered and comparing password in user data 
        const passwordMatch = await bcrypt.compare(password, userData.password)


        if (passwordMatch) {
          req.session.email = email;
          res.redirect('/');
        }
      } else if (userData.is_block === 1) {
        res.render('login', { message: "Your account has been blocked." });


      } else {
        res.render('login', { message: "Email or Password Entered is incorrect" });
      }


    } else {
      res.render('login', { message: "Email or Password Entered is incorrect" });
    }



  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
};


//logout //session destroy and redirect 
const userLogout = async (req, res) => {
  try {
    req.session.destroy()
    res.redirect('/')
  } catch (error) {
    console.log(error.message)
  }
}


//verify otp
const verifyOtp = async (req, res) => {
  try {
    let userotp = req.body.otp
     await User.updateOne({ email: registerTymEmail },{$set:{otp:userotp}})
    const ud=await User.findOne({otp:userotp})
    if (ud.otp == userotp) {
      const updateInfo = await User.updateOne({ email: registerTymEmail }, { $set: { is_varified: 1 } })
      
      res.redirect('/login')
    }
    else {
      res.render('otpVerification', { message: 'Entered otp is wrong' })
    }

  } catch (error) {
    console.log(console.error.mesage)
  }
}

// to load forget

const forgetLoad = async function (req, res) {
  try {
    res.render('forget')
  } catch (error) {
    console.log(error.message)

  }
}


//verify  foget mail post

const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email
    const userData = await User.findOne({ email: email });
    if (userData) {

      if (userData.is_varified === 0) {
        res.render('forget', { message: "Please Verify Your Email" });

      } else {
        const randomstring = Randomstring.generate();
        await User.updateOne({ email: email }, { $set: { token: randomstring } });
        sendResetPasswordMail(userData.name, userData.email, randomstring);
        res.render('forget', { message: "Please Check your Mail to Reset Password" });
      }

    } else {
      res.render('forget', { message: "Email Not Registered" });

    }

  } catch (error) {
    console.log(error.message);

  }
}


//to load product details

const loadProductDetails = async (req, res) => {
  try {
    const session = req.session.email
    const userData = await User.findOne({ email: session })
    const id = req.query.id
    const productData = await product.findOne({ _id: id })

    if (session) {
      const customer = true
      res.render('product-details', { userData, session, productData })

    }
    else {
      res.render('product-details', { productData, userData, session })
    }


  } catch (error) {
    console.log(error.message);
  }
}



//add to cart

const addTocart = async (req, res) => {
  try {
    const productId = req.body.id;
    const productData = await product.findOne({ _id: productId });
    
    const userData = await User.findOne({ email: req.session.email });
   

    
    if (req.session.email) {
      const userid = req.session.email;
      const cartData = await cart.findOne({ userId: userid })
      
      if (cartData) {
        const productExist = cartData.products.findIndex((product) => product.productId == productId)
        if (productExist != -1) {
          await cart.updateOne({ userId: userid, "products.productId": productId }, { $inc: { "products.$.count": 1 } });
        
          res.json({ success: true });
        } else {
          await cart.findOneAndUpdate({ userId: req.session.email }, { $push: { products: { productId: productId, productPrice: productData.price } } })
          res.json({ success: true });
          
        }



      } else {
        const Cart = new cart({
          userId: userData.email,
          userName: userData.name,
          products: [{
            productId: productId,
            productPrice: productData.price
          }]

        });
        const cartData = await Cart.save();
        if (cartData) {
        
          res.json({ success: true })
         
        } else {
          res.render('/home')
        }
      }

    } else {
      res.redirect('/')
    }

   
  } catch (error) {
    console.log(error.message);
  }

}




//load cart

const loadCart = async (req, res) => {
  try {
    const session = req.session.email;

    const userData = await User.findOne({ email: session });


    const cartData = await cart.findOne({ userId: req.session.email }).populate("products.productId");
   

    if (session) {
      if (cartData) {
        if (cartData.products.length > 0) {
          const products = cartData.products;


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
          
          const Total = total[0].total;
          const userCartId = userData._id
          
          res.render("cart", {
            userData,
            session,
            Total,
            userCartId,
            products,
          });
        } else {
          let customer = true;
          res.render("cartEmpty", {
            customer,
            userData,
            session,
            message: "No product added",
          });
        }
      } else {
        let customer = true;
        res.render("cartEmpty", {
          customer,
          userData,
          session,
          message: "No product added",
        });
      }
    } else {
      let customer = true;
      res.render("cartEmpty", {
        customer,
        userData,
        session,
        message: "No product added",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};



//load forget password
const loadForgetPassword=async(req,res)=>{
  try {
    const token=req.query.token
    const tokenData=await User.findOne({token:token});
    if(tokenData){
      res.render('forgetPassword',{user_id:tokenData._id})
    }
    
  } catch (error) {
    console.log(error.message);
  }
}

//to reset password
const resetPassword=async(req,res)=>{
  try {
    const password=req.body.password;
    const user_id=req.body.user_id
    const secure_password= await securePassword(password);
    const updatedData=await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:""}})
    res.redirect('/login')
  } catch (error) {
    
  }
}





//load about

const loadAbout = async (req, res) => {
  try {
    const session = req.session.email;
    const userData = await User.findOne({ email: session })
    res.render('about', { session, userData })
  } catch (error) {
    console.log(error.message);
  }
}



//to load profile

const loadProfile = async (req, res) => {
  try {
    const session = req.session.email
    const userData = await User.findOne({ email: session })
   

    res.render('profile', { userData, session, })

  } catch (error) {
    console.log(error.message)

  }
}

//to remove cart data

const removeCartdata=async(req,res)=>{
  try {
    //   console.log(req.query.id+'user')
    //  console.log(req.query.proid+"prod")
      const Id=req.session.email
      const remove=await cart.updateOne({userId:Id},{$pull:{products:{productId:req.query.proid}}})
     
      if(remove){
          res.redirect('/cart')
      }
  } catch (error) {
      console.log(error.message)
  }
}


const removewhishlist= async(req,res)=>{
  try {
    //   console.log(req.query.id+'user')
    //  console.log(req.query.proid+"prod")
      const Id=req.session.email
      const remove=await wishlist.updateOne({userId:Id},{$pull:{products:{productId:req.query.proid}}})
     
      if(remove){
          res.redirect('/wishlist')
      }
  } catch (error) {
      console.log(error.message)
  }
}



// //to load checkout

const loadCheckout = async (req, res) => {
  try {

    const session = req.session.email
    const addressData = await user_address.findOne({ user: req.session.email })
    const data = await product.find()
    const userData = await User.findOne({ email: session })
    const cartData = await cart.findOne({ userId: req.session.email }).populate("products.productId");
    let products = [];
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
    
    const Total = total[0].total;
    if(addressData){
     

    if (cartData&&cartData.products&&cartData.products.length > 0) {
      const address = addressData.address

      products = cartData.products;

      res.render('checkout', { userData, session, address, Total, products})
    }else{
      res.render('emptycheckout', { userData, session,Total, products});
    }
    } else {

      res.render('emptycheckout', { userData, session,Total, products});


    }

  } catch (error) {
    console.log(error.message)
  }
}

//load my orders
const loadMyOrders=async(req,res)=>{
  try {
    const session=req.session.email
    const userData=await User.findOne({email:session})
    
    const orderData = await order.find({user:userData.name})

   
    res.render('myOrder',{userData,session,orderData})
    
  } catch (error) {
    console.log(error.message);
  }
}

///invoice download
// const invoice = async (req, res) => {
//   try {
//       // const orderData = await order.find()
//       // const data = { orderData: orderData }

//       const id =req.query.id
            
//         const orderdetails = await order.findOne({_id:id}).populate("product.productId").sort({Date:-1})
        
//         const orderData= orderdetails.product

        
//         const data={
//             report:orderdetails,
//             data:orderData
// }




//       const filepathName = path.resolve(__dirname, '../views/users/invoicepdf.ejs');
//       const htmlString = fs.readFileSync(filepathName).toString();

//       let options = {
//           format: 'letter'

//       }

//       const ejsData = ejs.render(htmlString, data);
//       pdf.create(ejsData, options).toFile('invoice.pdf', (err, response) => {
//           if (err)
//               console.log(err);

//       })


//   } catch (error) {

//       console.log(error.message);
//   }
// }


//delete address
const deleteAddress=async(req,res)=>{
  try {
    
   const address=await addressData.updateOne({user:req.session.email},{$pull:{address:{_id:req.query.id}}})
  
   res.redirect("/checkout")
    
  } catch (error) {
    console.log(error);
 }
}




//checkout buy

const loadCheckoutBuy = async (req, res) => {
  try {

    const session = req.session.email
    const addressData = await user_address.findOne({ user: req.session.email })
    const data = await product.find()
    const userData = await User.findOne({ email: session })
    const productData=await product.findById({_id:req.query.id})
    
    
    let products = [];
    
    const Total = productData.price
   
    if(addressData){
     

    
      const address = addressData.address

      

      res.render('checkoutbuynow', { userData, session, address, Total,productData })
    
    } else {

      res.render('emptycheckout', { userData, session,Total,productData});


    }

  } catch (error) {
    console.log(error.message)
  }
}




//place order buy

const placeOrderBuy=async(req,res)=>{


  try {
   const userData = await User.findOne({ email: req.session.email });
  
   const session=req.session.email
   
 

 
   let productData=req.body.product
   
  
   const Total = productData.price
  
 
   const userWalletAmount = userData.wallet
         let paidAmount;
         let walletAmountUsed
         var walletAmountBalance
       
 
         
 
 
       //   if (userWalletAmount < Total) {
           paidAmount = req.body.amount
       //     walletAmountUsed = Total - paidAmount
       //     walletAmountBalance = userWalletAmount - walletAmountUsed   
       // } else {
       //     paidAmount = 0
       //     walletAmountUsed = Total
       //     walletAmountBalance = userWalletAmount - Total
       // }
        
       
       //  await User.findOneAndUpdate({ email: req.session.email }, { $set: { wallet: walletAmountBalance } })
 
   
       const payment = req.body.payment;
      
         const address=req.body.address
         
 
         if(payment!="online"){
           status="placed"
         }else{
           status="pending"
         }
 
         const newOrder = new order({
             deliveryDetails:address,
             user: userData.name,
             paymentMethod: payment,
             // wallet: walletAmountUsed,
             paid: paidAmount,
             product: productData._id,
             totalAmount: paidAmount,
             date: Date.now(),
             status: status
 
             
         });
 
         const saveOrder=await newOrder.save();
         
 
         if(status === "placed") {
           
             // await cart.deleteOne({ userId: userData.email });
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
 
 //verify online payment buy
 const verifyOnlinePaymentBuy =async(req,res)=>{
   try {
       
 
      
       const details= (req.body)
      
       const crypto = require('crypto');
       let hmac = crypto.createHmac('sha256', process.env.key_secret);
       hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)  
           
       hmac = hmac.digest('hex');
       
 
       
       
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
 










const ordershowLoad =async(req,res)=>{
  try {
      const userd=await User.findOne({email:req.session.email})
      const userData=await User.findOne({email:req.session.email})
      const id=req.query.id
      const session=req.session.email

      const orderData=await order.findById({_id:id}).populate("product.productId")
      const product=orderData.product
      
            res.render('singleOrder',{user:userd.name,product,orderData,session,userData})
  } catch (error) {
          console.log(error.message);        
  }
}
//




//
const addtowhishlist= async (req, res) => {
  try {
    const productId = req.body.id;
    const productData = await product.findOne({ _id: productId });
    
    const userData = await User.findOne({ email: req.session.email });
   

    
    if (req.session.email) {
      const userid = req.session.email;
      const wishlistData = await wishlist.findOne({ userId: userid })
      
      if (wishlistData) {
        const productExist = wishlistData.products.findIndex((product) => product.productId == productId)
        if (productExist != -1) {
          await wishlist.updateOne({ userId: userid, "products.productId": productId }, { $inc: { "products.$.count": 1 } });
        
          res.json({ success: true });
        } else {
          await wishlist.findOneAndUpdate({ userId: req.session.email }, { $push: { products: { productId: productId, productPrice: productData.price } } })
          res.json({ success: true });
          
        }



      } else {
        const Wishlist = new wishlist({
          userId: userData.email,
          userName: userData.name,
          products: [{
            productId: productId,
            productPrice: productData.price
          }]

        });
        const wishlistData = await Wishlist.save();
        if (wishlistData) {
        
          res.json({ success: true })
         
        } else {
          res.render('/home')
        }
      }

    } else {
      res.redirect('/')
    }

   
  } catch (error) {
    console.log(error.message);
  }

}


const loadwishlist = async (req, res) => {
  try {
    const session = req.session.email;

    const userData = await User.findOne({ email: session });


    const wishlistData= await wishlist.findOne({ userId: req.session.email }).populate("products.productId");
   

    if (session) {
      if (wishlistData) {
        if (wishlistData.products.length > 0) {
          const products = wishlistData.products;


          const total = await wishlist.aggregate([
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
          
          const Total = total[0].total;
          const userCartId = userData._id
          
          res.render("wishlist", {
            userData,
            session,
            Total,
            userCartId,
            products,
          });
        } else {
          let customer = true;
          res.render("cartEmpty", {
            customer,
            userData,
            session,
            message: "No product added",
          });
        }
      } else {
        let customer = true;
        res.render("cartEmpty", {
          customer,
          userData,
          session,
          message: "No product added",
        });
      }
    } else {
      let customer = true;
      res.render("cartEmpty", {
        customer,
        userData,
        session,
        message: "No product added",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};





module.exports = {
  loadHome,
  loadLogin,
  loadRegister,
  insertUser,
  verifyLogin,
  userLogout,
  verifyOtp,
  forgetLoad,
  forgetVerify,
  loadForgetPassword,
  resetPassword,
  loadProducts,
  loadProductDetails,
  loadCart,
  loadAbout,
  addTocart,
  loadProfile,
  loadCheckout,
  removeCartdata,
  addtowhishlist,
  loadwishlist,
  removewhishlist,
  loadMyOrders,
  deleteAddress,
  loadCheckoutBuy,
   placeOrderBuy,
  verifyOnlinePaymentBuy,
 
  ordershowLoad
  
  
  
  
  

  

}