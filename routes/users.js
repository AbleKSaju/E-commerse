const express = require("express");
const router = express.Router();
const user = require("../model/user-model");
const product=require("../model/products-model")
const order=require('../model/order-model')
const mongodb=require('mongodb')
const bcrypt=require('bcrypt')
const cart=require('../controller/cart-controller')
const categories=require('../model/category-model')
// const loggedIn = require("../middlewares/loggedin");
const auth = require("../middlewares/auth");
const userController = require("../controller/user-controller");
const { log } = require("debug/src/browser");
const { json } = require("body-parser");
const { logOut, listCategory } = require("../controller/admin-contoller");


router.get("/", userController.index);


      //LOGIN

router.get("/login",userController.login);

router.post("/login", userController.verifyLoggin);

router.get("/signup", userController.signup);

router.post("/signup", userController.verigySignup);

router.get("/otp-page",userController.otpPage);

router.post("/otp-page", userController.signUpOtpConfirm);

router.get("/otp-log",userController.loginOtp);

router.post("/otp-sent", userController.loginOtpSent);

router.post("/otp-login/:id", userController.loginOtpConfirm);


       // PRODUCTS

router.get("/show-products", userController.productShow);

router.get("/search",userController.searchProduct)

router.get('/brand/:id',userController.bradWise)

router.get('/subCategory/:cat',userController.subCategory)

router.get("/product-display",auth.isLogged,userController.productDetails);


        // CART

router.get("/cart",cart.getCart)

router.post("/cart", auth.isLogged,cart.addToCart)

router.get('/account',userController.account)

router.get('/add-address',auth.isLogged,userController.addAddress)

router.post('/add-address',auth.isLogged,userController.confirmAddress)

router.post('/remove-address',auth.isLogged,userController.removeAddress)

router.get('/edit-profile',auth.isLogged,userController.editAddress)

router.post('/edit-profile',auth.isLogged,userController.editProfile)

router.get('/change-password',auth.isLogged,userController.changePassword)

router.post('/change-password',auth.isLogged,userController.checkPassword);

router.post('/reset-password',auth.isLogged,userController.confirmPassword)

router.post('/change-quantity',auth.isLogged,cart.changeQuantity)

router.post('/removeFromCart',auth.isLogged,cart.removeFromCart)

router.post('/buy-now',auth.isLogged,cart.buyNow)

router.post('/buy/:proId',auth.isLogged,cart.buy)

router.post('/verifyPayment',auth.isLogged,cart.verify)


        //ORDER

router.post('/makePurchase',auth.isLogged,userController.makePurchase)

router.get('/orderDetails/:id',auth.isLogged,userController.orderPage)

router.post('/orderDetails',auth.isLogged,userController.orderDetails)
      
router.post('/cancel',userController.cancelOrder)


        //WishList

router.get('/wishlist',auth.isLogged,userController.wishList)

router.post('/wishlist',auth.isLogged,userController.addToWishList)
      
router.post('/removeWishlist',auth.isLogged,userController.removeWishList)      

router.get("/logout",userController.logOut)


module.exports = router;


     
