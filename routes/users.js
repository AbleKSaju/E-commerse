const express = require("express");
const router = express.Router();
const users = require("../model/user-model");
const product=require("../model/products-model")
const coupon=require("../model/coupon-model")
const mongodb=require('mongodb')
const bcrypt=require('bcrypt')
const cart=require('../controller/cart-controller')
const categories=require('../model/category-model')
const orderModel=require('../model/order-model')
const invoice=require("../middlewares/invoice")
const productController=require("../controller/product-controller")
const banner=require("../model/banner-model")
// const loggedIn = require("../middlewares/loggedin");
const auth = require("../middlewares/auth");
const userController = require("../controller/user-controller");
const easyinvoice = require('easyinvoice');
const { Readable } = require("stream");
const Razorpay=require("razorpay");
const { log } = require("debug/src/node");
const { request } = require("https");
var instance = new Razorpay({ key_id:process.env.RAZORPAY_KEY_ID, key_secret:process.env.RAZORPAY_KEY_SECRET})


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

router.get("/show-products", productController.productShow);

router.get("/search",productController.searchProduct)

router.get('/brand/:id',productController.bradWise)

router.get('/subCategory/:cat',productController.subCategory)

router.get("/product-display",auth.isLogged,productController.productDetails);

router.get("/color",async(req,res)=>{
                const banners = await banner.find({ location: "Products" }).lean();
                var datas = await categories.find().lean()
                await product
                      .find({ color: req.query.id ,isListed: '0' })
                      .lean()
                      .then((data) => {
                        data.reverse();
                        const itemsperpage = 6;
                        const currentpage = parseInt(req.query.page) || 1;
                        const startindex = (currentpage - 1) * itemsperpage;
                        const endindex = startindex + itemsperpage
                        const totalpages = Math.ceil(data.length / 6);
                        const currentproduct = data.slice(startindex,endindex);
                        res.render("user/products", {
                          data:datas,
                          products: currentproduct,
                          isLoggedIn: req.session.user,
                          totalPages:totalpages,
                          currentPage:currentpage,
                          banner: banners,
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  });
         



        // CART

router.get("/cart",cart.getCart)

router.post("/cart", auth.isLogged,cart.addToCart)

router.get('/account',userController.account)

router.post('/change-quantity',auth.isLogged,cart.changeQuantity)

router.post('/removeFromCart',auth.isLogged,cart.removeFromCart)

router.get('/buy-now',auth.isLogged,cart.buyNow)

router.post('/buy/:proId',auth.isLogged,cart.buy)

router.post('/verifyPayment',auth.isLogged,cart.verify)


        //PROFILE

router.get('/add-address',auth.isLogged,userController.addAddress)

router.post('/add-address',auth.isLogged,userController.confirmAddress)

router.get('/editAddress', userController.editAddress)
      
router.post('/editAddress',userController.editedAddress)
        
router.post('/remove-address',auth.isLogged,userController.removeAddress)
        
router.get('/edit-profile',auth.isLogged,userController.editProfile)
        
router.post('/edit-profile',auth.isLogged,userController.editedProfile)
        
router.get('/change-password',auth.isLogged,userController.changePassword)
        
router.post('/change-password',auth.isLogged,userController.checkPassword);
        
router.post('/reset-password',auth.isLogged,userController.confirmPassword)


        //ORDER

router.post('/makePurchase',auth.isLogged,userController.makePurchase)

router.post('/apply-coupon',auth.isLogged,userController.applyCoupon)
      
router.get('/orderDetails',auth.isLogged,userController.orderPage)

// router.post('/orderDetails',auth.isLogged,userController.orderDetails)
router.get('/orderDetailsPage',auth.isLogged,userController.orderDetails)

router.post('/returnOrder',auth.isLogged,userController.returnOrder)
      
router.post('/cancel',auth.isLogged,userController.cancelOrder)


        //WishList

router.get('/wishlist',auth.isLogged,userController.wishList)

router.post('/wishlist',auth.isLogged,userController.addToWishList)
      
router.post('/removeWishlist',auth.isLogged,userController.removeWishList) 


        //WALLET

router.get('/wallet',auth.isLogged,userController.wallet)

router.get('/getHistory',auth.isLogged,userController.history)

router.post('/add-money',auth.isLogged,userController.addMoney)

router.post('/verify-payment',auth.isLogged,userController.verifyPayment)


        //LOGOUT

router.get('/invoice',invoice.invoice)

router.get("/logout",userController.logOut)


module.exports = router;


     
