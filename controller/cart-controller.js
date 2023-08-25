const mongodb = require("mongodb");
const user = require("../model/user-model");
const { log } = require("debug/src/node");

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
    console.log(cartProducts);
    var totalPrice = 0;
    var quantity = 0;
    for (var i = 0; i < cartProducts.length; i++) {
      quantity = cartProducts[i].quantity;
      totalPrice =
        totalPrice + quantity * cartProducts[i].ProductDetails[0].saleprice;
    }
  }
  res.render("user/cart", {
    isLoggedIn: req.session.user,
    data: cartProducts,
    total: totalPrice,
  });
};

const makePurchase = async (req, res) => {
  var id = req.session.user;
  var productId = req.query.id;
  try {
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
  } catch (error) {
    console.error("Error updating cart item:", error);
  }
};

const changeQuantity = async (req, res) => {
  count = parseInt(req.body.count);
  quantity = parseInt(req.body.quantity);
  if (quantity == 1 && count == -1) {
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
  } else {
    user
      .updateOne(
        { _id: req.body.userId, "cart.productId": req.body.proId },
        { $inc: { "cart.$.quantity": count } },
        { new: true }
      )
      .then((data) => {
        res.json(true);
      })
      .catch((err) => {
        res.json(false);
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
  var totalPrice = req.body.total;
  var userId = req.session.user;
  var oid = new mongodb.ObjectId(userId);
  var products = await user.aggregate([
    {
      $match: { _id: oid },
    },
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
  await user.findOne({ _id: userId }).then((data) => {
    totalPrice = req.body.total;
    res.render("user/buy-now", {
      userData: data,
      status: products,
      total: totalPrice,
      isLoggedIn:req.session.user
    });
  });
};

module.exports = {
  getCart,
  makePurchase,
  changeQuantity,
  removeFromCart,
  buyNow,
};
