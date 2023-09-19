const express = require("express");
const router = express.Router();
const crop = require("../middlewares/crop");
const adminController = require("../controller/admin-contoller");
const salesController = require("../controller/sales-controller")
const bannerController = require("../controller/banner-controller")
const couponController = require("../controller/coupon-controller")
const bannerModel = require("../model/banner-model")
const order = require("../model/order-model");
const sharp = require("sharp");
const multers = require("../multer/multers");
const product = require("../model/products-model");
const user = require("../model/user-model");
const auth = require("../middlewares/auth");
const coupon = require("../model/coupon-model")
const { log } = require("debug/src/browser");
const mongodb = require("mongodb");
const moment = require("moment");
const async = require("hbs/lib/async");
const update = multers.update;
const upload = multers.upload;
const banner = multers.banner;


router.get("/",auth.adminLoggedIn,adminController.adminIndex);

router.get("/admin-login", adminController.adminLoggin);

router.post("/admin-login", adminController.loginConfirm);

router.get("/admin-dashboard",auth.adminLoggedIn, adminController.dashboard);

router.get('/monthly-report',auth.adminLoggedIn,adminController.graph)

//CATEGORY

router.get("/admin-category",auth.adminLoggedIn, adminController.adminCategory);

router.post("/admin-category",auth.adminLoggedIn,upload.single("image"),adminController.catCreation);

router.get("/edit-category/:id",auth.adminLoggedIn, adminController.editCategoryPage);

router.post("/edit-category",auth.adminLoggedIn,upload.single("image"),adminController.editCategory);

router.get("/unlist-category",auth.adminLoggedIn, adminController.unlistCategory);

router.get("/list-category",auth.adminLoggedIn, adminController.listCategory);


//PRODUCTS

router.get("/admin-products",auth.adminLoggedIn, adminController.productDisplay);

router.get("/admin-add-products",auth.adminLoggedIn, adminController.addProductPage);

router.post("/admin-add-products",auth.adminLoggedIn,update.array("image", 4),adminController.addProduct);

router.get("/delete-product/:id",auth.adminLoggedIn, adminController.deleteProduct);

router.get("/edit-products/:id", auth.adminLoggedIn,adminController.editProductPage);

router.post("/edit-products",auth.adminLoggedIn,update.array("image", 4),adminController.editProduct);

router.get("/unlist-product/:id",auth.adminLoggedIn, adminController.unlistUser);

router.get("/list-product/:id",auth.adminLoggedIn, adminController.listUser);


//USER

router.get("/users",auth.adminLoggedIn, adminController.users);

router.get("/block/:id",auth.adminLoggedIn, adminController.blockUser);

router.get("/unblock/:id",auth.adminLoggedIn, adminController.unblockUser);


//ORDER

router.get("/admin-orders",auth.adminLoggedIn, adminController.orders);

// router.post("/cancelOrder", adminController.cancelOrder);

// router.post("/makeOrder", adminController.makeOrder);

// router.post("/approved", adminController.approved);

router.get("/details",auth.adminLoggedIn, adminController.orderDetails);

router.post("/delivered",auth.adminLoggedIn, adminController.delivered);

router.get('/orderStatus',auth.adminLoggedIn,adminController.orderStatus)

router.get('/changeStatus',auth.adminLoggedIn,adminController.changeStatus)

// SALES

router.get('/salesReport',auth.adminLoggedIn,salesController.salesReport)

router.get("/salesToday",auth.adminLoggedIn,salesController.salesToday )

router.get('/salesWeekly',auth.adminLoggedIn,salesController.salesWeekly )

router.get('/salesMonthly',auth.adminLoggedIn,salesController.salesMonthly )

router.get('/salesYearly',auth.adminLoggedIn,salesController.salesYearly)


// BANNER

router.get('/bannerManagement',auth.adminLoggedIn,bannerController.bannerPage)

router.get('/addBanner',auth.adminLoggedIn,bannerController.addBanner)

router.post('/add-banner',auth.adminLoggedIn,banner.single("image"),crop.bannerCrop,bannerController.bannerAdded)

router.get('/editBanner/:id',auth.adminLoggedIn,bannerController.editBanner)

router.post('/editBanner',auth.adminLoggedIn,banner.single("image"),bannerController.bannerEdited);

router.get('/deleteBanner/:id',auth.adminLoggedIn,bannerController.deleteBanner)


    //COUPON

router.get('/coupon',auth.adminLoggedIn,couponController.coupons)

router.post('/coupon',auth.adminLoggedIn,couponController.couponAdded)

router.post("/couponStatus",auth.adminLoggedIn,couponController.couponStatus)


    //LOGOUT

router.get("/admin-logout", adminController.logOut)

module.exports = router;
