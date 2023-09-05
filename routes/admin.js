const express = require("express");
const router = express.Router();
const crop = require("../middlewares/crop");
const adminController = require("../controller/admin-contoller");
const salesController = require("../controller/sales-controller")
const bannerModel = require("../model/banner-model")
const order = require("../model/order-model");
const sharp = require("sharp");
const multers = require("../multer/multers");
const product = require("../model/products-model");
const user = require("../model/user-model");
const { log } = require("debug/src/browser");
const mongodb = require("mongodb");
const { cancelOrder, logOut } = require("../controller/user-controller");
const update = multers.update;
const upload = multers.upload;
const banner = multers.banner;

router.get("/", adminController.adminIndex);

router.get("/admin-login", adminController.adminLoggin);

router.post("/admin-login", adminController.loginConfirm);

router.get("/admin-dashboard", adminController.dashboard);


//CATEGORY

router.get("/admin-category", adminController.adminCategory);

router.post("/admin-category",upload.single("image"),adminController.catCreation);

router.get("/delete-category/:id", adminController.deleteCategory);

router.get("/edit-category/:id", adminController.editCategoryPage);

router.post("/edit-category",upload.single("image"),adminController.editCategory);

router.get("/unlist-category/:id", adminController.unlistCategory);

router.get("/list-category/:id", adminController.listCategory);


//PRODUCTS

router.get("/admin-products", adminController.productDisplay);

router.get("/admin-add-products", adminController.addProductPage);

router.post("/admin-add-products",update.array("image", 4),adminController.addProduct);

router.get("/delete-product/:id", adminController.deleteProduct);

router.get("/edit-products/:id", adminController.editProductPage);

router.post("/edit-products",update.array("image", 4),adminController.editProduct);

router.get("/unlist-product/:id", adminController.unlistUser);

router.get("/list-product/:id", adminController.listUser);


//USER

router.get("/users", adminController.users);

router.get("/block/:id", adminController.blockUser);

router.get("/unblock/:id", adminController.unblockUser);


//ORDER

router.get("/admin-orders", adminController.orders);

router.post("/cancelOrder", adminController.cancelOrder);

router.post("/makeOrder", adminController.makeOrder);

router.post("/approved", adminController.approved);

router.get("/details", adminController.orderDetails);

router.post("/delivered", adminController.delivered);


// SALES

router.get('/salesReport',salesController.salesReport)

router.get("/salesToday",salesController.salesToday )

router.get('/salesWeekly',salesController.salesWeekly )

router.get('/salesMonthly',salesController.salesMonthly )

router.get('/salesYearly',salesController.salesYearly)

router.get("/admin-logout", adminController.logOut);



router.get('/bannerManagement',async(req,res)=>{
    bannerModel.find().lean()
    .then((data)=>{
        console.log(data);
        res.render('admin/banner',{data})
    })
})

router.get('/addBanner',(req,res)=>{
    res.render('admin/add-banner')
})

router.post('/add-banner',banner.single("image"),crop.bannerCrop,(req,res)=>{
    const currentDate = new Date();
    const [year, month, day] = [
      currentDate.getFullYear(),
      (currentDate.getMonth() + 1).toString().padStart(2, "0"),
      currentDate.getDate().toString().padStart(2, "0"),
    ];
    var date = `${day} / ${month} / ${year}`;
    var newBanner=new bannerModel({
        title:req.body.name,
        description:req.body.description,
        location:req.body.location,
        link:req.body.link,
        image:req.file.filename,
        date:date
    })
    newBanner.save()
    res.redirect('/admin/bannerManagement')
})

router.get('/editBanner/:id',async (req,res)=>{
    console.log(req.params.id)
    await bannerModel.findOne({_id:req.params.id}).lean()
    .then((data)=>{
        console.log(data);
        res.render('admin/edit-banner',{data})
    })
})
router.post('/editBanner',banner.single("image"),(req, res, next) => {
    const currentDate = new Date();
    const [year, month, day] = [
        currentDate.getFullYear(),
        (currentDate.getMonth() + 1).toString().padStart(2, "0"),
        currentDate.getDate().toString().padStart(2, "0"),
    ];
    const date = `${day} / ${month} / ${year}`;
    const updateFields = {
        title: req.body.name,
        description: req.body.description,
        location: req.body.location,
        link: req.body.link,
        date: date
    };
    if (req.file) {
        crop.bannerCrop(req, res, () => {
            updateFields.image = req.file.filename;
            proceedWithUpdate();
        });
    } else {
        proceedWithUpdate();
    }
    async function proceedWithUpdate() {
        await bannerModel.findByIdAndUpdate(req.query.id, updateFields);
        res.redirect('/admin/bannerManagement');
    }
});


router.get('/deleteBanner/:id',async(req,res)=>{
    console.log(req.params.id);
    await bannerModel.findByIdAndRemove(req.params.id)
    .then((data)=>{
        res.redirect('/admin/bannerManagement')
    })
})

module.exports = router;
