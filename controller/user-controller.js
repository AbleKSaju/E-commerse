const user = require("../model/user-model");
const product = require("../model/products-model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const categories = require("../model/category-model");
const mongodb = require("mongodb");
const order = require("../model/order-model");
const coupon = require("../model/coupon-model");
const { log } = require("debug/src/browser");
const banner = require("../model/banner-model");
const Razorpay = require("razorpay");
const invoice = require("../middlewares/invoice");
require("dotenv").config();

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const index = async (req, res) => {
  try {
    if (req.query.id) {
      console.log("wallet");
      await user.findByIdAndUpdate(req.query.id, { $inc: { wallet: 200 } });
      await user.findByIdAndUpdate(
        req.query.id,
        {
          $push: {
            history: { amount: 200, status: "debit", date: Date.now() },
          },
        },
        { new: true }
      );
      await user.findByIdAndUpdate(req.session.user, { $inc: { wallet: 200 } });
      await user.findByIdAndUpdate(
        req.session.user,
        {
          $push: {
            history: { amount: 200, status: "debit", date: Date.now() },
          },
        },
        { new: true }
      );
    }
    // if(req.session.refralUser){
    //   await user.findByIdAndUpdate(req.session.refralUser,{$inc:{wallet:200}})
    //   await user.findByIdAndUpdate(req.session.user,{$inc:{wallet:200}})
    //   req.session.refralUser="used"
    // }
    const banners = await banner.find({ location: "Home" }).lean();
    const products = await product.find().sort({ createdOn: -1 }).lean();
    res.render("user/index", {
      isLoggedIn: req.session.user,
      banner: banners,
      products,
    });
  } catch (error) {
    console.log(error);
  }
};

const login = (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/login", {});
  }
};

const verifyLoggin = async (req, res) => {
  try {
    const userData = req.body;
    const userExist = await user.findOne({
      email: userData.email,
      verified: 0,
    });
    if (!userExist) {
      return res.render("user/login", {
        email: "Email Error",
      });
    }
    const passwordMatches = await bcrypt.compare(
      userData.password,
      userExist.password
    );
    if (!passwordMatches) {
      return res.render("user/login", {
        pass: "Password Error",
      });
    }
    req.session.user = userExist._id;
    res.redirect("/");
  } catch (error) {
    console.error("Error:", error);
    res.redirect("/login");
  }
};

const signup = (req, res) => {
  if (req.query.id) {
    req.session.refralUser = req.query.id;
  }

  res.render("user/signup", { exist: req.session.user });
  req.session.userExist = false;
};

const verigySignup = async (req, res) => {
  try {
    const userExist = await user.find({ email: req.body.email });
    const userData = req.body;

    if (userExist.length == 0) {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const otpExpiration = Date.now() + 1 * 60 * 1000;
      req.session.otp = { code: otp, expiresAt: otpExpiration };
      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
          authMethod: "PLAIN",
        },
      });
      const mail = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: "STEPZ otp verification",
        text: `Thank you for choosing Stepz. Use the following OTP to complete your Sign Up procedures. 
          ${otp}`,
      };

      transport.sendMail(mail, async (err, status) => {
        if (err) {
          console.log(err);
          res.send("Failed to send OTP. Please try again.");
        } else {
          req.session.signupData = req.body;
          res.redirect("/otp-page");
        }
      });
    } else {
      req.session.user = userExist[0]._id;
      res.redirect("/signup");
    }
  } catch (error) {
    console.error("Error:", error);
    res.redirect("/signup");
  }
};

const otpPage = (req, res) => {
  res.render("user/otp-page", { otp: req.session.otpErr });
};

const signUpOtpConfirm = async (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  if (req.session.otp.code == req.body.otp.join("")) {
    let spassword = await bcrypt.hash(req.session.signupData.password, 10);
    const newUser = new user({
      name: req.session.signupData.name,
      mobile: req.session.signupData.mobile,
      email: req.session.signupData.email,
      password: spassword,
    });

    try {
      const savedUser = await newUser.save();
      req.session.user = savedUser._id;
      if (req.session.refralUser) {
        var refral = req.session.refralUser;
        res.redirect(`/?id=${refral}`);
      } else {
        res.redirect("/");
      }
    } catch (error) {
      console.error(error);
      res.redirect("/error-page");
    }
  } else {
    req.session.otpErr = true;
    res.redirect("/otp-page");
  }
  2;
};

const loginOtp = (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/emailVerify");
  }
};

const loginOtpSent = async (req, res) => {
  try {
    if (req.session.otpSent) {
      res.redirect("/");
    } else {
      const userData = req.body;
      const userExist = await user.find({ email: userData.email, verified: 0 });

      if (userExist.length === 1) {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "ableksaju3@gmail.com",
            pass: "jxvshrcnlmpaxxqc",
            authMethod: "PLAIN",
          },
        });

        const mail = {
          from: "ableksaju3@gmail.com",
          to: req.body.email,
          subject: "STEPZ otp verification",
          text: `Use the following OTP to complete your Login procedures. 
            ${otp}`,
        };

        transport.sendMail(mail, async (err, status) => {
          if (err) {
            console.log(err);
            return res.send("Failed to send OTP. Please try again.");
          }

          await user.findByIdAndUpdate(
            userExist[0]._id,
            { otp: otp },
            { new: true }
          );
          req.session.otpSent = true;
          req.session.user = userExist[0]._id;
          res.render("user/otp-login", { id: userExist[0]._id });
        });
      } else {
      }
    }
  } catch (error) {
    console.error("Error:", error);
    res.send("An error occurred.");
  }
};

const loginOtpConfirm = async (req, res) => {
  if (req.session.user || req.session.otpSent) {
    res.redirect("/");
  } else {
    var id = req.params.id;
    var userExist = await user.findById({ _id: id }).lean();
    req.session.user = userExist._id;
    if (userExist.otp == req.body.otp.join("")) {
      res.redirect("/");
    } else {
      req.session.otpErr = true;
      res.render("user/otp-login", {
        id: userExist._id,
        otp: req.session.otpErr,
      });
    }
  }
};

// const productShow = async (req, res) => {

//   await categories
//     .find({})
//     .lean()
//     .then((data) => {
//       var x = "all";
//       product
//         .find({verified:'0'})
//         .lean()
//         .then((data) => {
//           const itemsperpage = 5;

//           const currentpage = parseInt(req.query.page) || 1;
//           const startindex = (currentpage - 1) * itemsperpage;
//           const endindex = startindex + itemsperpage;
//           const totalpages = Math.ceil(product.length / 5);
//           const currentproduct = product.slice(startindex,endindex);
//           res.render("user/products", {
//             data: data,
//             cat: x,
//             isLoggedIn: req.session.user,orders: currentproduct , totalpages , currentpage
//           });
//         })
//         .catch((err) => {
//           console.log(err);
//         })
//     })
// }

const makePurchase = async (req, res) => {
  console.log("ent");
  if (!req.body.addressId) {
    res.json({ status: false });
  } else if (req.body.payment == "paypal") {
    return res.json({ status: false });
  } else {
    var productUnit = true;
    var orderId;
    var totalPrice = parseInt(req.body.totalPrice);
    const currentDate = new Date();
    const [year, month, day] = [
      currentDate.getFullYear(),
      (currentDate.getMonth() + 1).toString().padStart(2, "0"),
      currentDate.getDate().toString().padStart(2, "0"),
    ];
    var date = `${day} / ${month} / ${year}`;
    id = req.session.user;
    let oid = new mongodb.ObjectId(id);
    if (req.body.quantity && req.body.size) {
      const products = await product.findOne({ _id: req.body.proId }).lean();
      if (products.units <= 0) {
        res.json({ status: "outOfStock" });
      } else {
        var data = await user.aggregate([
          {
            $match: { _id: oid },
          },
          {
            $unwind: "$address",
          },
          {
            $match: { "address._id": parseInt(req.body.addressId) },
          },
        ]);
        var proId = req.body.proId;
        var resultArray = [
          {
            productId: proId,
            quantity: req.body.quantity,
            size: req.body.size,
          },
        ];
        console.log(req.body);
        var quantity = data[0].cart.map((product) => product.quantity);
        var newOrder = await new order({
          address: data[0].address,
          product: resultArray,
          userId: req.body.userId,
          totalPrice: totalPrice,
          date: date,
          payment: req.body.payment,
          status: 0,
        });
        if (req.body.addWallet) {
          newOrder.wallet = req.body.addWallet;
        }
        const orderData = await newOrder.save();
        console.log(orderData, "od");

        orderId = orderData._id;
      }
    } else {
      var data = await user.aggregate([
        {
          $match: { _id: oid },
        },
        {
          $unwind: "$address",
        },
        {
          $match: { "address._id": parseInt(req.body.addressId) },
        },
      ]);
      var productIds = data[0].cart.map((product) => product.productId);
      const products = await product.findOne({ _id: productIds }).lean();
      if (products.units - data[0].cart[0].quantity <= 0) {
        productUnit = false;
      } else {
        var quantity = data[0].cart.map((product) => product.quantity);
        var newOrder = await new order({
          address: data[0].address,
          product: data[0].cart,
          userId: req.body.userId,
          totalPrice: totalPrice,
          date: date,
          payment: req.body.payment,
          status: 0,
        });
        if (req.body.addWallet) {
          newOrder.wallet = req.body.addWallet;
        }
        try {
          const orderData = await newOrder.save();
          console.log(orderData, "odataaaaa>>>>>>>");

          orderId = orderData._id;
          await user.findByIdAndUpdate(
            req.session.user,
            { $set: { cart: [] } },
            { new: true }
          );
        } catch (error) {
          console.error(error);
          res.json({ status: false, error: "Failed to save the order." });
        }
      }
    }
    if (req.body.wallet == 0) {
      await user.findByIdAndUpdate(req.session.user, { wallet: 0 });
    }
    if (req.body.payment == "cod" && productUnit === true) {
      res.json({ status: "cod" });
    } else if (req.body.payment == "razorpay" && productUnit === true) {
      console.log("hiii");
      instance.orders
        .create({
          amount: req.body.totalPrice * 100,
          currency: "INR",
          receipt: orderId,
        })
        .then((response) => {
          res.json({ status: "razorpay", order: response, id: orderId });
        });
    } else if (req.body.payment == "wallet" && productUnit === true) {
      var amount = -req.body.totalPrice;
      await user.findByIdAndUpdate(
        req.session.user,
        {
          $push: {
            history: { amount: amount, status: "debit", date: Date.now() },
          },
        },
        { new: true }
      );
      await user.findByIdAndUpdate(
        { _id: req.session.user },
        { $inc: { wallet: -req.body.totalPrice } }
      );
      res.json({ status: "wallet" });
    } else if (productUnit == false) {
      res.json({ status: "outOfStock" });
    } else {
      res.json({ status: false });
    }
    try {
      if (proId) {
        const quantity = parseInt(req.body.quantity);
        try {
          const productToUpdate = await product.findById(proId);
          if (productToUpdate) {
            const currentUnits = parseInt(productToUpdate.units);
            const updatedUnits = currentUnits - quantity;
            productToUpdate.units = updatedUnits;
            const updatedProduct = await productToUpdate.save();
          }
        } catch (err) {
          console.error(err);
        }
      } else if (
        productIds &&
        Array.isArray(productIds) &&
        Array.isArray(quantity) &&
        productIds.length === quantity.length
      ) {
        try {
          for (let i = 0; i < productIds.length; i++) {
            const productId = productIds[i];
            const qty = parseInt(quantity[i]);

            const productToUpdate = await product.findById(productId);

            if (!productToUpdate) {
              console.log(`Product with ID ${productId} not found.`);
            } else {
              const currentUnits = parseInt(productToUpdate.units);
              const newUnits = currentUnits - qty;
              productToUpdate.units = newUnits;
              await productToUpdate.save();
              console.log(
                `Product with ID ${productId} updated. New units: ${newUnits}`
              );
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
};

const applyCoupon = async (req, res) => {
  try {
    var offerPrice;
    const offer = await coupon.findOne({ code: req.body.name }).lean();
    if (!offer) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    offerPrice = parseInt(offer.offerPrice);
    console.log(req.body, "coupons");
    await coupon.findOneAndUpdate(
      { name: req.body.coupon },
      { $push: { user: req.session.user } }
    );
    res.json({ offerPrice: offerPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const orderPage = async (req, res) => {
  try {
    req.body;
    var orderDetails = await order.find({ userId: req.session.user }).lean();
    orderDetails.reverse();
    await user
      .findOne({ _id: req.session.user })
      .lean()
      .then((data) => {
        const itemsperpage = 10;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(orderDetails.length / 10);
        const currentproduct = orderDetails.slice(startindex, endindex);
        res.render("user/order", {
          order: currentproduct,
          data: data,
          currentpage,
          totalpages,
        });
      });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const orderDetails = async (req, res) => {
  await order
    .findOne({ _id: req.query.id })
    .lean()
    .then(async (data) => {
      let oid = new mongodb.ObjectId(req.query.id);
      let productDetails = await order.aggregate([
        { $match: { _id: oid } },
        { $unwind: "$product" },
        {
          $project: {
            proId: { $toObjectId: "$product.productId" },
            quantity: "$product.quantity",
            totalPrice: "$totalPrice",
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
      res.render("user/order-details", {
        orders: data,
        productDetails,
        isLoggedIn: req.session.user,
      });
    });
};

// const orderDetails = async (req, res) => {
// await order
//   .findById(req.body.oid)
//   .lean()
//   .then((data) => {
//     if (data) {
//       res.json({ status: data });
//     } else {
//       res.status(404).json({ error: "Order not found" });
//     }
//   })
//   .catch((err) => {
//     res.status(500).json({ error: "Internal server error" });
//   });
//};

// const cancelOrder = async (req, res) => {
//   console.log("ent");
//   console.log(req.body)
//   try {
//     if (req.body.payment == "wallet" || req.body.payment == "razorpay") {
//       await user.findByIdAndUpdate(req.session.user, {
//         $inc: { wallet: req.body.totalPrice },
//       })
//     }
//     await order.updateOne({ _id: req.body.orderId }, { status: "-1" })
//     await order
//       .find({ _id: req.body.orderId })
//       .lean()
//       .then((data) => {
//         console.log(data);
//         product.findByIdAndUpdate(data.product[i].productId,{$inc:{units:data.product[i].quantity}})
//       })
//     res.json({ status: true });
//   } catch (err) {
//     console.error(err, "err");
//     res.json({ status: false });
//   }
// };

const cancelOrder = async (req, res) => {
  try {
    if (req.body.payment == "wallet" || req.body.payment == "razorpay") {
      await user.findByIdAndUpdate(req.session.user, {
        $inc: { wallet: req.body.totalPrice },
      });
    }
    await order.updateOne({ _id: req.body.orderId }, { status: "-1" });
    const orderData = await order.findById(req.body.orderId).lean();

    for (let i = 0; i < orderData.product.length; i++) {
      await product.findByIdAndUpdate(orderData.product[i].productId, {
        $inc: { units: orderData.product[i].quantity },
      });
    }

    res.json({ status: true });
  } catch (err) {
    console.error(err, "err");
    res.json({ status: false });
  }
};

const wishList = async (req, res) => {
  var userId = req.session.user;
  var oid = new mongodb.ObjectId(userId);
  var wishList = await user.aggregate([
    { $match: { _id: oid } },
    { $unwind: "$wishList" },
    {
      $project: {
        proId: { $toObjectId: "$wishList.proId" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "proId",
        foreignField: "_id",
        as: "wishlist",
      },
    },
  ])
  res.render("user/wishlist", { isLoggedIn: req.session.user, data: wishList });
}

const addToWishList = async (req, res) => {
  try {
    const userId = req.session.user;
    const proId = req.body.proId;
    const userDoc = await user.findOne({
      _id: userId,
      "wishList.proId": proId,
    });
    if (userDoc) {
      res.json({ exist: true });
    } else {
      await user.findByIdAndUpdate(
        userId,
        { $addToSet: { wishList: { proId } } },
        { new: true }
      );
      res.json({ status: true });
    }
  } catch (error) {
    console.error(error);
  }
};

const removeWishList = async (req, res) => {
  await user
    .updateOne(
      { _id: req.session.user },
      { $pull: { wishList: { proId: req.body.proId } } }
    )
    .then((data) => {
      res.json(true);
    });
};

const addMoney = (req, res) => {
  try {
    var options = {
      amount: req.body.total * 100,
      currency: "INR",
      receipt: "" + Date.now(),
    };
    instance.orders.create(options, async function (err, order) {
      if (err) {
        console.log("Error while creating order : ", err);
      } else {
        var amount = order.amount / 100;
        console.log(amount);
        var x = await user.findByIdAndUpdate(
          req.session.user,
          {
            $push: {
              history: { amount: amount, status: "credit", date: Date.now() },
            },
          },
          { new: true }
        );
        res.json({ order: order, razorpay: true });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Cannot add amount into your acccount");
  }
};

const account = async (req, res) => {
  if (req.session.user) {
    id = req.session.user;
    await user
      .findOne({ _id: id })
      .lean()
      .then((data) => {
        res.render("user/account", {
          userData: data,
          isLoggedIn: req.session.user,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.redirect("/login");
  }
};

const addAddress = (req, res) => {
  res.render("user/add-address", { isLoggedIn: req.session.user });
};

const confirmAddress = async (req, res) => {
  var id = req.session.user;
  user
    .updateOne(
      { _id: id },
      {
        $push: {
          address: {
            _id: Date.now(),
            name: req.body.name,
            number: req.body.number,
            altNumber: req.body.altNumber,
            pinCode: req.body.pinCode,
            house: req.body.house,
            area: req.body.area,
            landmark: req.body.landmark,
            town: req.body.town,
            state: req.body.state,
          },
        },
      }
    )
    .then((data) => {
      res.redirect("/account");
    });
};
const editAddress = async (req, res) => {
  try {
    const usr = await user.findOne({ _id: req.session.user });
    const addr = usr.address.find((address) => address._id == req.query.id);
    res.render("user/edit-address", { address: addr, id: req.query.id });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal Server Error");
  }
};

const editedAddress = async (req, res) => {
  console.log(req.body.id);
  req.body.id = parseInt(req.body.id);
  console.log(req.session.user);
  const edited = await user.updateOne(
    {
      _id: req.session.user,
      "address._id": req.body.id,
    },
    {
      $set: {
        "address.$.name": req.body.name,
        "address.$.number": req.body.number,
        "address.$.altNumber": req.body.altNumber,
        "address.$.pinCode": req.body.pinCode,
        "address.$.house": req.body.house,
        "address.$.area": req.body.area,
        "address.$.landmark": req.body.landmark,
        "address.$.town": req.body.town,
        "address.$.state": req.body.state,
      },
    }
  );
  console.log(edited, "edd");
  res.redirect("/account");
};

const removeAddress = async (req, res) => {
  id = req.session.user;
  var addressId = parseInt(req.body.adressId);
  await user
    .updateOne({ _id: id }, { $pull: { address: { _id: addressId } } })
    .then((data) => {
      res.json(true);
    })
    .catch((err) => {
      json(false);
    });
};

const editProfile = async (req, res) => {
  await user
    .findOne({ _id: req.session.user })
    .lean()
    .then((data) => {
      res.render("user/edit-profile", { userData: data });
      req.session.userexists = false;
    })
    .catch((err) => {
      console.log(err);
    });
};

const returnOrder = async (req, res) => {
  const text = req.body.text.toString();
  const orderId = req.body.orderId;
  var updatedOrder = await order.findByIdAndUpdate(
    orderId,
    { status: "3", reason: text },
    { new: true }
  );
  await user.findByIdAndUpdate(updatedOrder.userId, {
    $inc: { wallet: updatedOrder.totalPrice },
  });
  res.json({ updatedOrder });
};

const verifyPayment = async (req, res) => {
  var details = req.body;
  var amount = details["order[order][amount]"] / 100;
  await user.findByIdAndUpdate(req.session.user, { $inc: { wallet: amount } });
};

const history = async (req, res) => {
  const userData = await user.findOne({ _id: req.session.user });
  const history = userData.history;

  const formattedHistory = history.map((entry) => {
    const timestamp = entry.date;
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;
    return { ...entry, formattedDate };
  });

  const wallet = userData.wallet;
  const itemsperpage = 15;
  const currentpage = parseInt(req.query.page) || 1;
  const startindex = (currentpage - 1) * itemsperpage;
  const endindex = startindex + itemsperpage;
  const totalpages = Math.ceil(formattedHistory.length / 15);
  const currentHistory = formattedHistory.slice(startindex, endindex);
  res.render("user/show-history", {
    isLoggedIn: req.session.user,
    history: currentHistory,
    currentpage,
    totalpages,
    wallet,
  });
};

const wallet = async (req, res) => {
  var userData = await user.findOne({ _id: req.session.user });
  res.render("user/wallet", { isLoggedIn: req.session.user, userData });
};

const editedProfile = async (req, res) => {
  console.log(req.body);
  await user
    .findByIdAndUpdate(req.session.user, {
      name: req.body.name,
      mobile: req.body.number,
      bio: req.body.bio,
    })
    .lean()
    .then((data) => {
      res.redirect("/account");
    });
};

const changePassword = (req, res) => {
  if (req.session.err) {
    res.redirect("/account");
  } else {
    res.render("user/change-password");
  }
};

const checkPassword = async (req, res) => {
  try {
    const id = req.session.user;
    const userData = await user.findById(id);
    if (!userData) {
      res.render("user/change-password", { err: "Password is Wrong" });
      return;
    }
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      userData.password
    );
    if (!passwordMatch) {
      req.session.err = true;
      res.render("user/change-password", { err: "Password is Wrong" });
      return;
    }
    res.render("user/confirm-password");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const confirmPassword = async (req, res) => {
  try {
    const userData = await user.findById(id);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password1, 10);

    await user.findByIdAndUpdate(userData._id, { password: hashedPassword });
    res.redirect("/account");
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const logOut = (req, res) => {
  req.session.user = null;
  res.redirect("/");
};

module.exports = {
  index,
  login,
  verifyLoggin,
  signup,
  verigySignup,
  signUpOtpConfirm,
  loginOtp,
  otpPage,
  loginOtpSent,
  makePurchase,
  applyCoupon,
  orderPage,
  orderDetails,
  cancelOrder,
  loginOtpConfirm,
  account,
  addAddress,
  confirmAddress,
  removeAddress,
  addMoney,
  editAddress,
  editedAddress,
  editedProfile,
  wallet,
  verifyPayment,
  returnOrder,
  changePassword,
  checkPassword,
  confirmPassword,
  wishList,
  addToWishList,
  removeWishList,
  logOut,
  editProfile,
  history,
};
