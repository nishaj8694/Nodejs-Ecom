const { createRequire } = require('module')
const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const { log } = require('console')
const category = require('../models/categoryModel');
const products = require('../models/productModel');
const order = require('../models/orderModel')
const puppeteer = require('puppeteer')
const brand= require ('../models/brandModel')
const size= require ('../models/sizeMode')
const color= require ('../models/colorModel')
const cloudinary = require('cloudinary').v2;
//pdf coverter requirements
// const ejs = require('ejs');
// const pdf = require('html-pdf');
// const fs = require('fs');
// const path = require('path');


cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    secure: true,
  });

//to load admin home
const loadAdminHome = async (req, res) => {
    try {
        const orderData = await order.find({ status: { $ne: "cancelled" } })

        let SubTotal = 0
        orderData.forEach(function (value) {
            SubTotal = SubTotal + value.totalAmount;
        })

        const cod = await order.find({ paymentMethod: "COD" }).count()
        const online = await order.find({ paymentMethod: "online" }).count()
        const totalOrder = await order.find({ status: { $ne: "cancelled" } }).count()
        const totalUser = await User.find().count()
        const totalProducts = await products.find().count()

        const paymentCount = await order.aggregate([{ $group: { _id: "$paymentMethod", count: { $count: {} } } }])
       

        const orderCanceled = await order.find({ status: "cancelled" }).count()
       
        const orderplaced = await order.find({ status: "placed" }).count()
        const orderReturn = await order.find({ status: "Return Approved" }).count()
        const deliveredCount = await order.find({ status:"Delivered" }).count()
        
        

        const date = new Date()
        const year = date.getFullYear()
        const currentYear = new Date(year, 0, 1)

        const salesByYear = await order.aggregate([
            {
                $match: {
                    createdAt: { $gte: currentYear }, status: { $ne: "cancelled" }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%m", date: "$createdAt" } },
                    total: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])


        let sales = []
        for (i = 1; i < 13; i++) {
            let result = true
            for (j = 0; j < salesByYear.length; j++) {
                result = false
                if (salesByYear[j]._id == i) {
                    sales.push(salesByYear[j])
                    break;
                } else {
                    result = true

                }
            }
            if (result) {
                sales.push({ _id: i, total: 0, count: 0 })
            }

        }

        let yearChart = []
        for (i = 0; i < sales.length; i++) {
            yearChart.push(sales[i].total)
        }



        res.render('adminHome', { data: orderData, total: SubTotal, cod, online, totalOrder, 
            totalUser, totalProducts, yearChart,orderCanceled,orderplaced,orderReturn,deliveredCount,paymentCount })

    } catch (error) {
        console.log(error.messaage)
    }
}


//to load admin login page
const loadAdminLogin = async (req, res) => {
    try {
        res.render('adminLogin');

    } catch (error) {
        console.log(error.message)

    }
}


//to verify login

const verifyLogin = async (req, res) => {

    try {
        const email = req.body.email
        const password = req.body.password

        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    res.render('adminLogin', { message: 'Email and Password is Incorrect' })

                } else {
                    req.session.admin_id = userData._id;
                    res.redirect("/admin")
                }

            } else {
                res.render('adminLogin', { message: 'Email and Password incorrect' })
            }

        } else {
            res.render('adminLogin', { message: 'Email and Password incorrect' })
        }

    } catch (error) {

        console.log(error.message)
    }
}


//logout

const logout = async (req, res) => {
    try {
        req.session.admin_id = false;
        res.redirect('/admin/login');
    } catch (error) {
        console.log(error.message);
    }

}


//load user managemnt with user data

const loadUserManagement = async (req, res) => {
    try {
        const usersData = await User.find({ is_admin: 0 })
        res.render('userManagement', { users: usersData });

    } catch (error) {
        console.log(error.message)

    }
}



//load product page

const loadProducts = async (req, res) => {
    try {
        const Data = await products.find()

        res.render('productDetails', { data: Data })
    } catch (error) {
        console.log(error.message)

    }
}

//load categorymanagement

const loadCategory = async (req, res) => {
    try {
        const Data = await category.find()
        res.render('categoryManagement', { data: Data })

    } catch (error) {
        console.log(error.message)

    }
}

//load categorymanagement

const loadAddCategory = async (req, res) => {
    try {

        res.render('addCategory')
    } catch (error) {
        console.log(error.message)

    }
}

const loadAddProducts = async (req, res) => {
    try {
        const categoryData = await category.find()
        const brandData= await brand.find()
        const sizeData=await size.find()
        const colorData= await color.find()
       
        res.render('addProducts', { categoryData: categoryData,brandData,sizeData,colorData })
    } catch (error) {
        console.log(error.message)

    }
}



//to block

const blockUser = async (req, res) => {
    try {
        const id = req.query.id;
        await User.updateOne({ _id: id }, { $set: { is_block: 1 } })
        res.redirect("/admin/user")
    } catch (error) {
        console.log(error.message);
    }
}

//to unblock

const unBlockUser = async (req, res) => {
    try {
        const id = req.query.id;
        await User.updateOne({ _id: id }, { $set: { is_block: 0 } })
        res.redirect("/admin/user")
    } catch (error) {
        console.log(error.message);
    }
}




//add category
const Addcategory = async (req, res) => {
    try {
        const newCategory = req.body.name
        const add = new category({
            category: newCategory,
            is_block: false
        })
        const data = await add.save()
        if (data) {
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message)
    }

}


//to delete category
const deleteCategory = async (req, res) => {
    try {
        const Id = req.query.id
        const data = await category.findByIdAndDelete({ _id: Id });
        if (data) {
            res.redirect('/admin/category')
        }


    } catch (error) {
        console.log(error.message);

    }
}

//to insert product

const insertProduct = async (req, res) => {
    try {

        const data = await cloudinary.uploader.upload(
            "./public/admin/img/" + req.file.filename
          );
          
          
          const cdnArr=data.secure_url


        const product = new products({
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            stock: req.body.stock,
            image: cdnArr,
            description: req.body.description,
            brand: req.body.brand,
            size: req.body.size,
            color: req.body.color,
            is_block: 0
        });
        const productdata = await product.save();
        res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message);

    }

}

//to delete product

const deleteProduct = async (req, res) => {
    try {
        const Id = req.query.id
        const data = await products.findByIdAndDelete({ _id: Id });
        if (data) {
            res.redirect('/admin/products')
        }


    } catch (error) {

    }
}


//to load edit product

const loadeditProduct = async (req, res) => {
    try {
        const id = req.query.id
        const data = await products.findById({ _id: id })
        const cata = await category.find()
        res.render('editProduct', { data, cata })
    } catch (error) {
        console.log(error.message);
    }

}

//edit product

const addEditProduct = async (req, res) => {
    try {
        const id = req.body.id;
        const data = await cloudinary.uploader.upload(
            "./public/admin/img/" + req.file.filename
          );
          
          
          const cdnArr=data.secure_url
        await products.updateMany({ _id: id }, { $set: { name: req.body.name, 
            price: req.body.price,
             category: req.body.catagory, 
             image: cdnArr, 
             description: req.body.description,
              stock: req.body.stock } })
        res.redirect("/admin/products")
    } catch (error) {
        console.log(error.message);
    }
}


//to load order management
const loadOrderManagement = async (req, res) => {
    try {
        const orderData = await order.find()

        res.render('orderManagement', { orderData });

    } catch (error) {
        console.log(error.message)

    }
}


//to cancel order
const cancelOrder = async (req, res) => {
    try {
        const id = req.query.id;
        const orderData = await order.findOne({ _id: id });

        if (orderData.status === "placed") {
            await order.updateOne({ _id: id }, { $set: { status: "cancelled" } })
            res.redirect('/admin/order')
        } else {

            res.redirect('/admin/order')
        }
        

    } catch (error) {
        console.log(error.message);

    }
}



//delover stats

const DeliverOrder = async (req, res) => {
    try {
        const id = req.query.id;
        const orderData = await order.findOne({ _id: id });
        if (orderData.status === "placed") {
            await order.updateOne({ _id: id }, { $set: { status: "Delivered" } })
            res.redirect('/admin/order')
        } else {

            res.redirect('/admin/order')
        }

    } catch (error) {
        console.log(error.message);

    }
}



// to approve return

const ApproveReturn = async (req, res) => {
    try {
        const id = req.query.id;
        const userData=await User.findOne({email:req.session.email})
        const orderData = await order.findOne({ _id: id });
        if (orderData.status === "pending") {
            await order.updateOne({ _id: id }, { $set: { status: "Return Approved" } })
            const totalamount=orderData.totalAmount
            const wallet=userData.wallet
            const refund=wallet+totalamount
            await User.updateOne({email:req.session.email},{$set:{wallet:refund}})

            res.redirect('/admin/order')
        } else {

            res.redirect('/admin/order')
        }



    } catch (error) {
        console.log(error.message);
    }
}

//export order report
// const exportOrder =async (req, res) =>{
//     try {
//         const from = req.query.from
//         const to = req.query.to


//         const data = {
//             report: req.session.Orderdtls,
          
//         }

//         const filepath = path.resolve(__dirname, '../views/admin/salesreporttopdf.ejs')
//         const htmlstring = fs.readFileSync(filepath).toString()

//         let option = {
//             format: "A3"
//         }
//         const ejsData = ejs.render(htmlstring, data)
//         pdf.create(ejsData, option).toFile('salesReport.pdf', (err, response) => {
//             if (err) console.log(err);

//             const filepath = path.resolve(__dirname, '../salesReport.pdf')
//             fs.readFile(filepath, (err, file) => {
//                 if (err) {
//                     console.log(err);
//                     return res.status(500).send('could not download file')
//                 }
//                 res.setHeader('Content-Type', 'application/pdf')
//                 res.setHeader('Content-Disposition', 'attatchment;filename="Sales Report.pdf"')

//                 res.send(file)

//             })
//         })
//     } catch (error) {

//         console.log(error.message);

//     }}


//reject return
const RejectReturn = async (req, res) => {
    try {
        const id = req.query.id;
        const orderData = await order.findOne({ _id: id });
        if (orderData.status === "pending"&& orderData.status !== "Return Approved") {
            await order.updateOne({ _id: id }, { $set: { status: "Return Rejected" } })
            res.redirect('/admin/order')
        } else {

            res.redirect('/admin/order')
        }



    } catch (error) {
        console.log(error.message);
    }
}


//load sales report

const moment = require("moment-timezone");

const loadSalesreport = async (req, res) => {
    try {
        let from = req.query.from ? moment.utc(req.query.from) : "ALL";
        let to = req.query.to ? moment.utc(req.query.to) : "ALL";

        if (from !== "ALL" && to !== "ALL") {
            const orderdetails = await order.aggregate([
                {
                    $match: {
                        date: {
                            $gte: new Date(from),
                            $lte: new Date(to.endOf("day"))
                        },
                        status: {
                            $nin: ["cancelled", "returned"]
                        }
                    }
                }
            ]);
            req.session.Orderdtls = orderdetails
            res.render("SalesReport", { orderData: orderdetails, from, to });
        } else {
            const orderdetails = await order.find({
                status: { $nin: ["cancelled", "returned"] }
            });
           
            req.session.Orderdtls = orderdetails
            res.render("SalesReport", { orderData: orderdetails, from, to });
        }
    } catch (error) {
        console.log(error);
    }
};


//view page order

const showOrder =async(req,res)=>{
    try {

        const id =req.query.id
        const orderData=await order.findById({_id:id}).populate("product.productId")
        const product=orderData.product

        


        res.render('adminsingleorder',{orderData,product})
    } catch (error) {
        console.log(error.message);
        
    }
}










module.exports = {
    loadAdminHome,
    loadAdminLogin,
    verifyLogin,
    logout,
    loadUserManagement,
    blockUser,
    unBlockUser,
    loadProducts,
    loadCategory,
    loadAddCategory,
    loadAddProducts,
    Addcategory,
    deleteCategory,
    insertProduct,
    deleteProduct,
    loadeditProduct,
    addEditProduct,
    loadOrderManagement,
    cancelOrder,
    DeliverOrder,
    ApproveReturn,
    RejectReturn,
    loadSalesreport,
    showOrder




}