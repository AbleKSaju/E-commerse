const express = require("express");
const router = express.Router();
const crop=require('../middlewares/crop')
const adminController=require('../controller/admin-contoller')
const order=require('../model/order-model')
const sharp=require('sharp')
const multers=require('../multer/multers')
const product=require('../model/products-model');
const user=require('../model/user-model')
const { log } = require("debug/src/browser");
const mongodb = require("mongodb");
const update = multers.update
const upload = multers.upload


router.get("/",adminController.adminIndex)

router.get("/admin-login",adminController.adminLoggin)

router.post("/admin-login",adminController.loginConfirm);

router.get("/admin-dashboard", adminController.dashboard);

          //CATEGORY

router.get("/admin-category",adminController.adminCategory);

router.post("/admin-category", upload.single("image"),adminController.catCreation);

router.get("/delete-category/:id",adminController.deleteCategory);

router.get('/edit-category/:id',adminController.editCategoryPage)

router.post('/edit-category', upload.single("image"),adminController.editCategory)

router.get('/unlist-category/:id',adminController.unlistCategory)

router.get('/list-category/:id',adminController.listCategory)

  

          //PRODUCTS

router.get("/admin-products",adminController.productDisplay)

router.get("/admin-add-products",adminController.addProductPage)

router.post("/admin-add-products",update.array('image',4),adminController.addProduct)

router.get('/delete-product/:id',adminController.deleteProduct)

router.get('/edit-products/:id',adminController.editProductPage)

router.post('/edit-products',update.array('image',4),adminController.editProduct)

router.get('/unlist-product/:id',adminController.unlistUser)

router.get('/list-product/:id',adminController.listUser)


           //USER

router.get('/users',adminController.users)

router.get('/block/:id',adminController.blockUser)

router.get('/unblock/:id',adminController.unblockUser)


router.get('/admin-orders',(req,res)=>{
    order.find().lean()
    .then((data)=>{
        res.render('admin/orders',{data:data})
    }).catch((err)=>{
        console.log(err);
    })
})


router.post('/cancelOrder',async(req,res)=>{
    await order.updateOne({_id:req.body.id},{status:'-1'})
    .then((data)=>{
        res.json(true)  
    }).catch((err)=>{
        console.log(err);
        res.json(false)
    })
    })

    router.post('/makeOrder',async(req,res)=>{
        await order.updateOne({_id:req.body.id},{status:'0'})
        .then((data)=>{
            res.json(true)  
        }).catch((err)=>{
            console.log(err);
            res.json(false)
        })
        })

        router.post('/approved',async(req,res)=>{
            await order.updateOne({_id:req.body.id},{status:'1'})
            .then((data)=>{
                res.json(true)  
            }).catch((err)=>{
                console.log(err);
                res.json(false)
            })
            })

      
        
        router.get('/details',async (req,res)=>{
            var orderId=req.query.id
            var oid=new mongodb.ObjectId(orderId)
            var Details = await order.aggregate([
                { $match: { _id: oid } },
                { $unwind: "$product" },
                {
                    $project: {
                        proId: { $toObjectId: "$product.productId" },
                        totalPrice: "$totalPrice",
                        status: "$status"
                    },
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "proId",
                        foreignField: "_id",
                        as: "ProductDetails",
                    },
                },
            ])
            order.find({_id:orderId}).lean()
            .then((data)=>{
                res.render('admin/order-details',{data:data,details:Details,pDetails:Details.ProductDetails})
            }).catch((err)=>{
                console.log(err)
            })
        })

        router.post('/delivered',async(req,res)=>{
            console.log(req.body.id ,"hiiii");
            await order.updateOne({_id:req.body.id},{status:'2'})
            .then((data)=>{
                res.json(true)  
            }).catch((err)=>{
                console.log(err);
                res.json(false)
            })
            })




router.get("/admin-logout", adminController.logOut);

module.exports = router;
