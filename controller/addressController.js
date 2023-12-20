const User = require("../models/userModel");
const category = require('../models/categoryModel');
const user_address = require('../models/addressmodel')

const product = require('../models/productModel')
const cart = require('../models/cartModel');
const { log } = require("console");


//to load address

const loadAddress = async (req, res) => {
    try {
        const session = req.session.email
        const userData = await User.find({ email: session })
        res.render('addAddress', { session, userData });

    } catch (error) {
        console.log(error.message);

    }
}


//verify address

const verifyAddress = async (req, res) => {
    try {
        const user = req.session.email;
        const userData = await User.findOne({ email: req.session.email })
        const addressdata = await user_address.findOne({ user: req.session.email });
        if (addressdata) {

            const update = await user_address.updateOne({ user: user }, {$push: {
                    address: {
                        name: req.body.name,
                        mobile: req.body.mobile,
                        email: req.body.email,
                        city: req.body.city,
                        pin: req.body.pin,
                        country: req.body.country,
                        address: req.body.address


                    }
                }
            })

            if (update) {
                res.redirect('/checkout')
            } else {
                res.redirect('/checkout')
            }

        } else {
            const data = new user_address({
                user: userData.email,
                address: [{
                    name: req.body.name,
                    mobile: req.body.mobile,
                    email: req.body.email,
                    city: req.body.city,
                    pin: req.body.pin,
                    country: req.body.country,
                    address: req.body.address
                }]

            })
            const dataAddress = await data.save();
            if (dataAddress) {
                res.redirect('/checkout')
            } else ('/checkout')

        }

    } catch (error) {
        console.log(error.message)

    }
}




module.exports = {
    loadAddress,
    verifyAddress
}