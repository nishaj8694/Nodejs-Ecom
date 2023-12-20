
const express = require('express');
const admin_route= express();
const adminController=require('../controller/adminController');
const adminAuth=require('../middleware/adminAuth')
const upload=require('../middleware/multer')
admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');


admin_route.get('/',adminAuth.isLogin, adminController.loadAdminHome);
admin_route.get('/login',adminAuth.isLogout, adminController.loadAdminLogin);
admin_route.get('/logout',adminController.logout);
admin_route.get('/user',adminAuth.isLogin,adminController.loadUserManagement);
admin_route.get('/block',adminAuth.isLogin,adminController.blockUser);
admin_route.get('/unblock',adminAuth.isLogin,adminController.unBlockUser);
admin_route.get('/products',adminAuth.isLogin,adminController.loadProducts);
admin_route.get('/category',adminAuth.isLogin,adminController.loadCategory);
admin_route.get('/addcategory',adminAuth.isLogin,adminController.loadAddCategory);
admin_route.get('/deleteCategory',adminAuth.isLogin,adminController.deleteCategory);
admin_route.get('/addProducts',adminAuth.isLogin,adminController.loadAddProducts);
admin_route.get('/deleteCategory',adminAuth.isLogin,adminController.deleteCategory);
admin_route.get('/editProduct',adminAuth.isLogin,adminController.loadeditProduct);
admin_route.get('/deleteProduct',adminAuth.isLogin,adminController.deleteProduct);
admin_route.get('/order',adminAuth.isLogin,adminController.loadOrderManagement);
admin_route.get('/order_status',adminAuth.isLogin,adminController.cancelOrder)
admin_route.get('/orderDeliver_status',adminAuth.isLogin,adminController.DeliverOrder)
admin_route.get('/orderReturn_status',adminAuth.isLogin,adminController.ApproveReturn)
admin_route.get('/orderReject_status',adminAuth.isLogin,adminController.RejectReturn)
// admin_route.get('/export-order-pdf',adminAuth.isLogin,adminController.exportOrder)
admin_route.get('/single_orderAdmin',adminAuth.isLogin,adminController.showOrder);
admin_route.get('/report',adminAuth.isLogin,adminController.loadSalesreport);
admin_route.post('/login',adminController.verifyLogin);
admin_route.post('/addcategory',adminController.Addcategory);
admin_route.post('/addProducts',upload.upload.single('image'),adminController.insertProduct);
admin_route.post('/editProduct',upload.upload.single('image'),adminController.addEditProduct);



module.exports=admin_route;
