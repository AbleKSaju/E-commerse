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
const coupon = require("../model/coupon-model")
const { log } = require("debug/src/browser");
const mongodb = require("mongodb");
const moment = require("moment");
const async = require("hbs/lib/async");
const update = multers.update;
const upload = multers.upload;
const banner = multers.banner;

router.get("/", adminController.adminIndex);

router.get('/monthly-report',adminController.graph)

router.get("/admin-login", adminController.adminLoggin);

router.post("/admin-login", adminController.loginConfirm);

router.get("/admin-dashboard", adminController.dashboard);


//CATEGORY

router.get("/admin-category", adminController.adminCategory);

router.post("/admin-category",upload.single("image"),adminController.catCreation);

router.get("/delete-category/:id", adminController.deleteCategory);

router.get("/edit-category/:id", adminController.editCategoryPage);

router.post("/edit-category",upload.single("image"),adminController.editCategory);

router.get("/unlist-category", adminController.unlistCategory);

router.get("/list-category", adminController.listCategory);


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

// router.post("/cancelOrder", adminController.cancelOrder);

// router.post("/makeOrder", adminController.makeOrder);

// router.post("/approved", adminController.approved);

router.get("/details", adminController.orderDetails);

router.post("/delivered", adminController.delivered);

router.get('/orderStatus',adminController.orderStatus)

router.get('/changeStatus',adminController.changeStatus)

// SALES

router.get('/salesReport',salesController.salesReport)

router.get("/salesToday",salesController.salesToday )

router.get('/salesWeekly',salesController.salesWeekly )

router.get('/salesMonthly',salesController.salesMonthly )

router.get('/salesYearly',salesController.salesYearly)


// BANNER

router.get('/bannerManagement',bannerController.bannerPage)

router.get('/addBanner',bannerController.addBanner)

router.post('/add-banner',banner.single("image"),crop.bannerCrop,bannerController.bannerAdded)

router.get('/editBanner/:id',bannerController.editBanner)

router.post('/editBanner',banner.single("image"),bannerController.bannerEdited);

router.get('/deleteBanner/:id',bannerController.deleteBanner)


    //COUPON

router.get('/coupon',couponController.coupons)

router.post('/coupon',couponController.couponAdded)

router.post("/couponStatus",couponController.couponStatus)


    //LOGOUT

router.get("/admin-logout", adminController.logOut)

module.exports = router;
