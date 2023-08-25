const express = require("express");
const router = express.Router();
const user = require("../model/user-model");
const product=require("../model/products-model")
const order=require('../model/order-model')
const mongodb=require('mongodb')
const bcrypt=require('bcrypt')
const cache=require('../middlewares/cache')
const cart=require('../controller/cart-controller')
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

router.get("/show-products",auth.isLogged, userController.productShow);

router.get("/product-display",auth.isLogged,userController.productDetails);


        // CART

router.get("/cart",auth.isLogged,cart.getCart)

router.post("/cart", auth.isLogged,cart.makePurchase)

router.get('/account',auth.isLogged,userController.account)

router.get('/add-address',auth.isLogged,userController.addAddress)

router.post('/add-address',auth.isLogged,userController.confirmAddress)

router.post('/remove-address',auth.isLogged,userController.removeAddress)

router.get('/edit-profile',auth.isLogged,userController.editAddress)

router.post('/edit-profile/:id',auth.isLogged,userController.editProfile)

router.get('/change-password',auth.isLogged,userController.changePassword)

router.post('/change-password',auth.isLogged,userController.checkPassword);

router.post('/reset-password',auth.isLogged,userController.confirmPassword)

router.post('/change-quantity',auth.isLogged,cart.changeQuantity)

router.post('/removeFromCart',auth.isLogged,cart.removeFromCart)

router.post('/buy-now',auth.isLogged,cart.buyNow)

router.post('/makePurchase',async(req,res)=>{
  const totalPrice=parseInt(req.body.totalPrice)
  const currentDate = new Date();
const [year, month, day] = [
  currentDate.getFullYear(),
  (currentDate.getMonth() + 1).toString().padStart(2, '0'),
  currentDate.getDate().toString().padStart(2, '0')
]
var date=(`${day} / ${month} / ${year}`);
  id=req.session.user
  let oid = new mongodb.ObjectId(id)
         var data = await user.aggregate([
            {
                $match:{_id:oid}
            },
            {
                $unwind:'$address'
            },
            {
                $match:{'address._id': parseInt(req.body.addressId)}
            }
        ])        
  let newOrder=  await new order({
    address:data[0].address,
    product:data[0].cart,
    userId:req.body.userId,
    totalPrice:totalPrice,
    date:date,
    payment:req.body.payment,
    status:0
  })
  await newOrder.save()
  .then((orderData) => {
    res.json({ status: true, id: orderData._id });
    user.findByIdAndUpdate(
      req.session.user,
      { $set: { cart: [] } },
      { new: true }
    )
    .then((userData) => {
      console.log(userData);
    })
  })
  .catch((error) => {
    console.error(error);
    res.json({ status: false, error: 'Failed to save the order.' });
  });
})


// router.get('/orderDetails/:id',async (req,res)=>{
//  let userId = req.session.user;
//   let oid = new mongodb.ObjectId(userId);
//   var orderDetails=await user.aggregate([
//     { $match:{_id:oid}},
//     {$unwind:"$cart"},
//     {
//       $project:{
//         proId:{$toObject:"$cart.productId"},
//         quantity:"$cart.quantity",
//         size:"$cart.size"
//       },
//       $lookup:{
//         from:"products",
//         localField:"proId",
//         foreignField:"_id",
//         as:"orderDetails"
//       }
//     }
//   ])
//   console.log(orderDetails);
//       res.render('user/order-details')
//   })


router.get('/orderDetails/:id', async (req, res) => {
  try {
    let userId = req.session.user;
    const currentDate = new Date()
    const [year, month, day] = [
      currentDate.getFullYear(),
      (currentDate.getMonth() + 1).toString().padStart(2, '0'),
      currentDate.getDate().toString().padStart(2, '0')
    ]
    var date=(`${day} / ${month} / ${year}`);
    let oid = new mongodb.ObjectId(userId);

    var orderDetails = await order.aggregate([
      { $match: { userId:req.session.user} },
      { $unwind: "$product" },
      {
        $project: {
          proId: { $toObjectId: "$product.productId" },
          quantity: "$product.quantity",
          size: "$product.size",
          address: "$address",
          status: "$status",
          totalPrice:"$totalPrice",
          date:"date"
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "proId",
          foreignField: "_id",
          as: "orderDetails"
        }
      }
    ])
    console.log(orderDetails,"od");
    await user.findOne({_id:req.session.user}).lean()
    .then((data)=>{
      res.render('user/order',{order:orderDetails,data:data,date:date});
    })
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
})
// ShowOrders:async(req,res)=>{
//   let orders =  await orderModel.aggregate([
//       {$match:{userId:req.params.id}},
//       {$unwind:'$items'},
//       {$project:{
//           proId:{'$toObjectId':'$items.ProductId'},
//           quantity:'$items.quantity',
//           size:'$items.size',
//           adress:'$adress',
//           GrandTotal:'$GrandTotal',
//           orderedOn:'$createdOn'
//       }},
//       {$lookup:{
//           from:'products',
//           localField:'proId', 
//           foreignField:'_id',
//           as:'ProductDetails',
//       }}
//   ])
//   console.log("Ordersss",orders)
//   res.render('user/orders',{orders})
// },





router.get("/logout",userController.logOut)

module.exports = router;


     
