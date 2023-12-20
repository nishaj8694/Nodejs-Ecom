const { urlencoded } = require('express');
const express = require('express');
const user_route= express();
const userController=require('../controller/userController');
const config=require('../config/config')
const session  =require('express-session')
const userAuth=require('../middleware/userAuth')
const addressController=require('../controller/addressController')
const orderController=require('../controller/orderController')
user_route.use(session({ secret:config.sessionSecret,saveUninitialized:true, resave:false, Cookie:{maxage:120000}}))
//view engine setting
user_route.set('view engine','ejs');
user_route.set('views','./views/users');
user_route.use(express.json())
user_route.use(express.urlencoded({extended:true}));

user_route.get('/', userController.loadHome);
user_route.get('/login',userAuth.isLogout, userController.loadLogin);
user_route.get('/register',userAuth.isLogout, userController.loadRegister);
user_route.get('/logout', userController.userLogout);
user_route.get('/forget',userAuth.isLogout,userController.forgetLoad);
user_route.get('/products',userAuth.isLogout,userController.loadProducts);
user_route.get('/product-detail',userAuth.isLogout,userController.loadProductDetails);
user_route.get('/cart',userAuth.isLogout,userController.loadCart);
user_route.get('/about',userAuth.isLogout,userController.loadAbout);
user_route.get('/myorder',userAuth.isLogout,userController.loadMyOrders)
user_route.get('/verify',userAuth.isLogout,userController.loadForgetPassword)
user_route.get('/order-placed',userAuth.isLogin,orderController.orderplaced)
user_route.get('/delete_address',userAuth.isLogin,userController.deleteAddress)
user_route.get('/profile',userAuth.isLogout,userController.loadProfile)
user_route.get('/checkout',userAuth.isLogout,userController.loadCheckout)
user_route.get('/cartdelete',userAuth.isLogout,userController.removeCartdata)
user_route.get("/whishlistdelete",userAuth.isLogout,userController.removewhishlist)

//for addresscontroller
user_route.get('/address',userAuth.isLogout,addressController.loadAddress);
user_route.post('/address',addressController.verifyAddress)
//for order
user_route.post('/checkout',orderController.placeOrder)
user_route.post('/verifyPayment',orderController.verifyOnlinePayment)
user_route.get('/userorder_status',userAuth.isLogout,orderController.cancelOrder)
user_route.get('/order-place',userAuth.isLogout,orderController.orderplaced)
user_route.get('/userReturn_order',userAuth.isLogout,orderController.returnOrder)
// user_route.get('/invoice_order',userAuth.isLogout,userController.invoice)
user_route.get('/chekoutBuy',userAuth.isLogout,userController.loadCheckoutBuy)
user_route.post('/chekoutBuy',userController.placeOrderBuy)
user_route.post('/verifyPaymentBuy',userController.verifyOnlinePaymentBuy)
user_route.post('/register',userController.insertUser);
user_route.post('/login',userController.verifyLogin);
user_route.post('/verify-otp',userController.verifyOtp);
user_route.post('/forget',userController.forgetVerify)
user_route.post('/addToCart',userController.addTocart)
user_route.get('/wishlist',userAuth.isLogout,userController.loadwishlist);
user_route.post('/addTowishlist',userController.addtowhishlist)
user_route.post('/verify',userController.resetPassword)
user_route.get('/single_order',userAuth.isLogout,userController.ordershowLoad)







module.exports= user_route