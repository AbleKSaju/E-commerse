const mongodb = require("mongodb");
const user = require("../model/user-model");
const coupon = require("../model/coupon-model");
const product = require("../model/products-model");
const { log } = require("debug/src/node");
const { productDisplay } = require("./admin-contoller");

const getCart = async (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    let userId = req.session.user;
    let oid = new mongodb.ObjectId(userId);
    var cartProducts = await user.aggregate([
      { $match: { _id: oid } },
      { $unwind: "$cart" },
      {
        $project: {
          proId: { $toObjectId: "$cart.productId" },
          quantity: "$cart.quantity",
          size: "$cart.size",
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
    ]);

    var totalPrice = 0;
    var quantity = 0;
    for (var i = 0; i < cartProducts.length; i++) {
      quantity = cartProducts[i].quantity;
      totalPrice =
        totalPrice + quantity * cartProducts[i].ProductDetails[0].saleprice;
    }
    var userData = await user.findOne({ _id: req.session.user });
    var products=await product.find().lean()
  }
  res.render("user/cart", {
    isLoggedIn: req.session.user,
    products,
    data: cartProducts,
    total: totalPrice,
    userData,
    unitErr:req.session.unitErr
  });
};

const addToCart = async (req, res) => {
  var id = req.session.user;
  var productId = req.query.id;
  try {
    const products = await product.findOne({ _id: productId }).lean();
    if (products.units <= 0) {
      res.json({ status: "outOfStock" });
    } else {
      const userData = await user.findById({ _id: id }).lean();
      if (userData.cart) {
        const cartIndex = userData.cart.findIndex(
          (item) => item.productId === productId
        );
        if (cartIndex !== -1) {
          const productInCart = userData.cart[cartIndex];
          const newQuantity =
            parseInt(productInCart.quantity) + parseInt(req.body.quantity);
          await user.updateOne(
            { _id: id, "cart.productId": productId },
            {
              $set: {
                "cart.$.quantity": newQuantity,
                "cart.$.size": req.body.size,
              },
            }
          );
          res.json({ status: true });
        } else {
          var quantity = parseInt(req.body.quantity);
          await user
            .findByIdAndUpdate(
              { _id: id },
              {
                $push: {
                  cart: { productId, quantity: quantity, size: req.body.size },
                },
              }
            )
            .then((data) => {
              res.json({ status: true });
            });
        }
      }
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
  }
};

const changeQuantity = async (req, res) => {
  req.body.count = parseInt(req.body.count);
  req.body.quantity = parseInt(req.body.quantity);
  total = req.body.count + req.body.quantity;
  if (
    (req.body.quantity >= 1 && req.body.count == 1) ||
    (req.body.quantity > 1 && req.body.count == -1)
  ) {
    user
      .updateOne(
        { "cart.productId": req.body.proId, _id: req.body.userId },
        { $set: { "cart.$.quantity": total } }
      )
      .then((status) => {
        res.json({ status: false });
      });
  }
};

const removeFromCart = async (req, res) => {
  await user
    .updateOne(
      { _id: req.body.userId },
      { $pull: { cart: { productId: req.body.proId } } }
    )
    .then((data) => {
      res.json(true);
    })
    .catch((err) => {
      res.json(false);
    });
};

const buyNow = async (req, res) => {
  let userId = req.session.user;
  let oid = new mongodb.ObjectId(userId);
  let productDetails = await user.aggregate([
    { $match: { _id: oid } },
    { $unwind: "$cart" },
    {
      $project: {
        proId: { $toObjectId: "$cart.productId" },
        size: "$cart.size",
        quantity: "$cart.quantity",
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
  ]);
  let totalPrice = 0;
  for (let i = 0; i < productDetails.length; i++) {
    if(productDetails[i].quantity>productDetails[i].ProductDetails[0].units){
      req.session.unitErr=true
      return res.redirect("/cart")
    }
    req.session.unitErr=false
    let qua = parseInt(productDetails[i].quantity);
    totalPrice =
      totalPrice +
      qua * parseInt(productDetails[i].ProductDetails[0].saleprice);
  }
  try {
    const userData = await user.findOne({ _id: userId });
    const coupons = await coupon
    .find({
      status: "1",
    })
    .lean();
    const sessionUser = req.session.user;
    if (coupons.length === 0) {
      res.render("user/buy-now", {
        userData,
        method: false,
        quantity: null,
        coupons: null,
        status: productDetails,
        total: totalPrice,
        isLoggedIn: req.session.user,
      });
    } else {
      const filteredCoupons = coupons.filter(
        (couponData) => !couponData.user.includes(sessionUser)&&
        parseInt(totalPrice) > parseInt(couponData.minimumPrice)
      );
      if (filteredCoupons.length === 0) {
        res.render("user/buy-now", {
          userData,
          method: false,
          quantity: null,
          coupons: null,
          status: productDetails,
          total: totalPrice,
          isLoggedIn: req.session.user,
        });
      } else {
        res.render("user/buy-now", {
          userData,
          method: false,
          quantity: null,
          coupons: filteredCoupons,
          status: productDetails,
          total: totalPrice,
          isLoggedIn: req.session.user,
        });
      }
    }

  } catch (error) {
    console.error(error);
  }
};

const buy = async (req, res) => {
  const userId = req.session.user;
  try {
    const proId = req.params.proId;
    const products = await product.aggregate([
      {
        $match: { _id: new mongodb.ObjectId(proId) },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "ProductDetails",
        },
      },
    ]);
    const userData = await user.findOne({ _id: userId });

    const coupons = await coupon.find({ status: "1" }).lean();
    const sessionUser = req.session.user;
    if (coupons.length === 0) {
      res.render("user/buy-now", {
        userData,
        method: true,
        size: req.body.size,
        total: req.body.totalPrice,
        quantity: req.body.quantity,
        isLoggedIn: req.session.user,
        coupons: null,
        status: products,
      });
    } else {
      const filteredCoupons = coupons.filter(
        (couponData) => !couponData.user.includes(sessionUser)
      );

      if (filteredCoupons.length === 0) {
        res.render("user/buy-now", {
          userData,
          method: true,
          size: req.body.size,
          total: req.body.totalPrice,
          quantity: req.body.quantity,
          isLoggedIn: req.session.user,
          coupons: null,
          status: products,
        });
      } else {
        res.render("user/buy-now", {
          userData,
          method: true,
          size: req.body.size,
          total: req.body.totalPrice,
          quantity: req.body.quantity,
          isLoggedIn: req.session.user,
          coupons: filteredCoupons,
          status: products,
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const verify = (req, res) => {
  console.log(req.body,"Bodyu");
  const crypto = require("crypto");
  let hmac = crypto.createHmac("sha256", "FawYUz1dMjHVYWrf9ZEUjOXi");
  hmac.update(
    req.body["payment[razorpay_order_id]"] +
      "|" +
      req.body["payment[razorpay_payment_id]"]
  );
  hmac = hmac.digest("hex");
  console.log(hmac,"HMACC");

  if (hmac == req.body["payment[razorpay_signature]"]) {
    console.log("True");
    res.json({ status: true });
  } else {
    console.log("FAle");
    res.json({ status: false });
  }
};

module.exports = {
  getCart,
  addToCart,
  changeQuantity,
  removeFromCart,
  buyNow,
  buy,
  verify,
};
