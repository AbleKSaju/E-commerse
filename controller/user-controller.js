const user = require("../model/user-model");
const product = require("../model/products-model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const categories = require("../model/category-model");
const { log } = require("debug/src/browser");

const index = (req, res) => {
  try {
    res.render("user/index", { isLoggedIn:req.session.user });
  } catch (error) {
    console.log(error);
  }
}


const login = (req, res) => {
  if(req.session.user){
res.redirect("/")
  }else{
  res.render("user/login", {
  })
}}


const verifyLoggin = async (req, res) => {
  try {
    const userData = req.body
    const userExist = await user.findOne({ email: userData.email, verified: 0 })
    if (!userExist) {

      return res.render("user/login", {
        email: "Email Error",
      })
    }
    const passwordMatches = await bcrypt.compare(userData.password, userExist.password)
    if (!passwordMatches) {

      return res.render("user/login", {
        pass: "Password Error",
      })
    }
    req.session.user = userExist._id
    res.redirect("/")
  } catch (error) {
    console.error("Error:", error);
    res.redirect("/login");
  }
}


const signup = (req, res) => {
  res.render("user/signup", { exist: req.session.user })
  req.session.userExist = false
}


const verigySignup = async (req, res) => {
  try {

    const userExist = await user.find({ email: req.body.email })
    const userData = req.body;

    if (userExist.length == 0) {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const otpExpiration = Date.now() + 1 * 60 * 1000;
      req.session.otp = { code: otp, expiresAt: otpExpiration };
      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ableksaju3@gmail.com",
          pass: "jxvshrcnlmpaxxqc",
          authMethod: "PLAIN",
        },
      })
      const mail = {
        from: "ableksaju3@gmail.com",
        to: req.body.email,
        subject: "STEPZ otp verification",
        text: `Thank you for choosing Stepz. Use the following OTP to complete your Sign Up procedures. 
          ${otp}`,
      }

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
    res.redirect("/signup")
  }
};


const otpPage = (req, res) => {
  res.render("user/otp-page", { otp: req.session.otpErr });
};

// const signUpOtpConfirm = async (req, res) => {
//   if (req.session.otp.code == req.body.otp.join("")) {
//     req.session.isLoggedIn = true;
//     let spassword = await bcrypt.hash(req.session.signupData.password, 10);
//     var create = new user({
//       name: req.session.signupData.name,
//       mobile: req.session.signupData.mobile,
//       email: req.session.signupData.email,
//       password: spassword,
//     });
//     await create.save();
//     res.redirect("/");
//   } else {
//     req.session.otpErr = true;
//     res.redirect("/otp-page");
//   }
// }
const signUpOtpConfirm = async (req, res) => {
  if(req.session.user){
    return res.redirect('/')
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
      const savedUser = await newUser.save()
      req.session.user = savedUser._id
      res.redirect("/");
    } catch (error) {
      console.error(error);
      res.redirect("/error-page");
    }
  } else {
    req.session.otpErr = true;
    res.redirect("/otp-page");
  }
};


const loginOtp = (req, res) => {
  if(req.session.user){
    res.redirect('/')
  }else{
    console.log("ohh");
  res.render("user/emailVerify");
  }
}


const loginOtpSent = async (req, res) => {
  try {
    if(req.session.otpSent){
        res.redirect('/')
    }else{
      console.log("ooo");
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
        })
  
        const mail = {
          from: "ableksaju3@gmail.com",
          to: req.body.email,
          subject: "STEPZ otp verification",
          text: `Use the following OTP to complete your Login procedures. 
            ${otp}`,
        }
  
        transport.sendMail(mail, async (err, status) => {
          if (err) {
            console.log(err);
            return res.send("Failed to send OTP. Please try again.");
          }

          await user.findByIdAndUpdate(
            userExist[0]._id,
            { otp: otp},
            { new: true }
          )
          req.session.otpSent=true
          req.session.user = userExist[0]._id;
          res.render("user/otp-login", { id: userExist[0]._id })
        })
      } else {
         
      }
    }
   
  } catch (error) {
    console.error("Error:", error);
    res.send("An error occurred.");
  }
};


const loginOtpConfirm = async (req, res) => {
  if(req.session.user||req.session.otpSent){
      res.redirect('/')
  }else{
  var id = req.params.id;
  var userExist = await user.findById({ _id: id }).lean();
  req.session.user = userExist._id;
  if (userExist.otp == req.body.otp.join("")) {
    res.redirect("/")
  } else {
    req.session.otpErr = true;
    res.render("user/otp-login", {
      id: userExist._id,
      otp: req.session.otpErr,
    })
  }
}
};

const productShow = async (req, res) => {
  await categories.find().lean()
  .then((data)=>{
    var x=data
     product
    .find()
    .lean()
    .then((data) => {
      res.render("user/products", {
        data: data,
        cat:x,
        isLoggedIn: req.session.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
})
}
const productDetails = (req, res) => {
  id = req.query.id;
  product
    .find({ _id: id })
    .lean()
    .then((data) => {
      console.log(data,"data");
      res.render("user/product-display", {
        data: data,
        isLoggedIn: req.session.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

const account=async (req,res)=>{
  if(req.session.user){
    id=req.session.user
    await user.findOne({_id:id}).lean()
    .then((data)=>{
      res.render('user/account',{userData:data,isLoggedIn:req.session.user})
    }).catch((err)=>{
      console.log(err);
    })
  }else{
    res.redirect('/login')
  }
}

const addAddress=(req,res)=>{
  res.render('user/add-address',{isLoggedIn:req.session.user})
}

const confirmAddress=async (req,res)=>{
  var id=req.session.user
  user.updateOne({_id:id},{$push:{address:{
    _id:Date.now(),
   name:req.body.name,
   number:req.body.number,
   altNumber:req.body.altNumber,
   pinCode:req.body.pinCode,
   house:req.body.house,
   area:req.body.area,
   landmark:req.body.landmark,
   town:req.body.town,
   state:req.body.state
  }}
}).then((data)=>{
  res.redirect('/account')
})
}

const removeAddress=async (req,res)=>{
  id=req.session.user
  var addressId=parseInt(req.body.adressId)
  console.log(addressId);
   await user.updateOne({_id:id},{$pull:{address:{_id:addressId}}})
   .then((data)=>{
    console.log(data);
    res.json(true)
   }).catch((err)=>{
    json(false)
   })
}

const editAddress=async (req,res)=>{
  await user.findOne({_id:req.session.user}).lean()
  .then((data)=>{
    res.render('user/edit-profile',{userData:data,exist:req.session.userexists})
    req.session.userexists=false
  }).catch((err)=>{
    console.log(err);
  })
}

const editProfile=async (req,res)=>{
  var userExist=await user.find({email:req.body.email})
  if(userExist){
    req.session.userexists=true
    res.redirect('/edit-profile')
  }else{
  await user.findByIdAndUpdate(req.params.id,{name:req.body.name,email:req.body.email,number:req.body.number})
  res.redirect('/account')
  }
}

const changePassword=(req,res)=>{
  if(req.session.err){
    res.redirect('/account')
  }else{
    res.render('user/change-password')
  }
}

const checkPassword= async (req, res) => {
  try {
    const id = req.session.user;
    const userData = await user.findById(id);
    if (!userData) {
      res.render('user/change-password',{err:"Password is Wrong"})
      return;
    }
    const passwordMatch = await bcrypt.compare(req.body.password, userData.password);
    if (!passwordMatch) {
      req.session.err = true;
      res.render('user/change-password',{err:"Password is Wrong"})
      return;
    }
    res.render('user/confirm-password');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
}

const confirmPassword= async (req, res) => {
  try {
      const userData = await user.findById(id);
      if (!userData) {
          return res.status(404).json({ error: 'User not found' });
      }
      const hashedPassword = await bcrypt.hash(req.body.password1, 10);

      await user.findByIdAndUpdate(userData._id, { password: hashedPassword });

      console.log('Password reset successfully');
      res.redirect('/account');
  } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}

const logOut=(req, res) => {
  req.session.user=null
  res.redirect("/");
}

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
  productShow,
  productDetails,
  loginOtpConfirm,
  account,
  addAddress,
  confirmAddress,
  removeAddress,
  editAddress,
  changePassword,
  checkPassword,
  confirmPassword,
  logOut,
  editProfile
};



// const verigySignup = async (req, res) => {
//   var userExist = await user.find({ email: req.body.email });
//   var userData = req.body;

//   if (userExist.length == 0) {
//     const otp = Math.floor(1000 + Math.random() * 9000).toString();
//     const otpExpiration = Date.now() + 1 * 60 * 1000;
//     req.session.otp = { code: otp, expiresAt: otpExpiration };
//     let transport = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "ableksaju3@gmail.com",
//         pass: "jxvshrcnlmpaxxqc",
//         authMethod: "PLAIN",
//       },
//     });
//     var mail = {
//       from: "ableksaju3@gmail.com",
//       to: req.body.email,
//       subject: "STEPZ otp verification",
//       text: `Thank you for choosing Stepz. Use the following OTP to complete your Sign Up procedures. 
//           ${otp} `,
//     };
//     transport.sendMail(mail, async (err, status) => {
//       if (err) {
//         console.log(err);
//         res.send("Failed to send OTP. Please try again.");
//       } else {
//         req.session.signupData = req.body;
//         res.redirect("/otp-page");
//       }
//     });
//   } else {
//     req.session.userExist = true;
//     res.redirect("/signup");
//   }
// };