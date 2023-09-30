const { productDetails } = require("./user-controller");
const user = require("../model/user-model");
const product = require("../model/products-model");
const categories = require("../model/category-model");
const bcrypt = require("bcrypt");
const mongodb = require("mongodb");
const order = require("../model/order-model");
const { log } = require("debug/src/browser");
const { search } = require("../routes/users")
const moment = require("moment");
const PDFDocument=require('pdfkit')


const adminLoggin = (req, res) => {
  if (req.session.adminLoggedIn == true) {
    res.render("admin/dashboard");
  } else {
  res.render("admin/login", {
    email: req.session.emilErr,
    pass: req.session.pasErr,
    notAdmin: req.session.notAdmin,
  });
}
};

const adminIndex = (req, res) => {
  if (req.session.adminLoggedIn == true) {
    res.render("admin/dashboard");
  } else {
    res.redirect("/admin/admin-login");
  }
};

const graph=async(req,res)=>{
  try {
    const start = moment().subtract(30, 'days').startOf('day');
    const end = moment().endOf('day');

    const orderSuccessDetails = await order.find({
      createdOn: { $gte: start, $lte: end },
      status: '2' 
    });
    const monthlySales = {}; 

    orderSuccessDetails.forEach(order => {
      const monthName = moment(order.order_date).format('MMMM');
      if (!monthlySales[monthName]) {
        monthlySales[monthName] = {
          revenue: 0,
          productCount: 0,
          orderCount: 0,
          codCount: 0,
          razorpayCount: 0,
          walletCount: 0
        };
      }
      monthlySales[monthName].revenue += order.totalPrice;
      monthlySales[monthName].productCount += order.product.length;
      monthlySales[monthName].orderCount++;

      if (order.payment=== 'cod') {
        monthlySales[monthName].codCount++;
      } else if (order.payment === 'razorpay') {
        monthlySales[monthName].razorpayCount++;
      } else if (order.payment === 'wallet') {
          monthlySales[monthName].walletCount++;
        } 
    });

    const monthlyData = {
      labels: [],
      revenueData: [],
      productCountData: [],
      orderCountData: [],
      codCountData: [],
      razorpayCountData: [],
      walletCountData: [],

    };

    for (const monthName in monthlySales) {
      if (monthlySales.hasOwnProperty(monthName)) {
        monthlyData.labels.push(monthName);
        monthlyData.revenueData.push(monthlySales[monthName].revenue);
        monthlyData.productCountData.push(monthlySales[monthName].productCount);
        monthlyData.orderCountData.push(monthlySales[monthName].orderCount);
        monthlyData.codCountData.push(monthlySales[monthName].codCount);
        monthlyData.razorpayCountData.push(monthlySales[monthName].razorpayCount);
        monthlyData.walletCountData.push(monthlySales[monthName].walletCount);
      }
    }
    return res.json(monthlyData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while generating the monthly report.' });
  }
}

const monthlyreport=async(req,res)=>{
  try {
    const start = moment().subtract(30, 'days').startOf('day'); // Data for the last 30 days
    const end = moment().endOf('day');

    const orderSuccessDetails = await orderModel.find({
      createdAt: { $gte: start, $lte: end },
      orderStatus: 'Delivered' 
    });
    const monthlySales = {}; 

    orderSuccessDetails.forEach(order => {
      const monthName = moment(order.order_date).format('MMMM');
      if (!monthlySales[monthName]) {
        monthlySales[monthName] = {
          revenue: 0,
          productCount: 0,
          orderCount: 0,
          codCount: 0,
          razorpayCount: 0,
        };
      }
      monthlySales[monthName].revenue += order.GrandTotal;
      monthlySales[monthName].productCount += order.items.length;
      monthlySales[monthName].orderCount++;

      if (order.payment=== 'cod') {
        monthlySales[monthName].codCount++;
      } else if (order.payment === 'Razorpay') {
        monthlySales[monthName].razorpayCount++;
      } 
    });

    const monthlyData = {
      labels: [],
      revenueData: [],
      productCountData: [],
      orderCountData: [],
      codCountData: [],
      razorpayCountData: [],
    };

    for (const monthName in monthlySales) {
      if (monthlySales.hasOwnProperty(monthName)) {
        monthlyData.labels.push(monthName);
        monthlyData.revenueData.push(monthlySales[monthName].revenue);
        monthlyData.productCountData.push(monthlySales[monthName].productCount);
        monthlyData.orderCountData.push(monthlySales[monthName].orderCount);
        monthlyData.codCountData.push(monthlySales[monthName].codCount);
        monthlyData.razorpayCountData.push(monthlySales[monthName].razorpayCount);
      }
    }
    return res.json(monthlyData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while generating the monthly report.' });
  }
};

const loginConfirm = async (req, res) => {
  var admin = await user.find({ email: req.body.email });
  var userData = req.body;
  if (admin.length !== 1) {
    req.session.emailErr = true;
    res.redirect("/admin/admin-login");
    req.session.emilErr = false;
  } else {
    if (admin[0].isadmin == 1 && admin[0].mobile == 1234567896) {
      await bcrypt
        .compare(userData.password, admin[0].password)
        .then((status) => {
          if (status) {
            req.session.adminLoggedIn = true;
            res.redirect("/admin");
          } else {
            req.session.emilErr = true;
            res.redirect("/admin/admin-login");
          }
        })
        .catch((err) => {
          console.log("Failed", err);
        });
    } else {
      req.session.emilErr = true;
      res.redirect("/admin/admin-login");
    }
  }
};

const dashboard = (req, res) => {
  res.render("admin/dashboard");
};

const adminCategory = async (req, res) => {
  await categories
    .find()
    .lean()
    .then((categories) => {
      categories.reverse()
      const itemsperpage = 6;
      const currentpage = parseInt(req.query.page) || 1;
      const startindex = (currentpage - 1) * itemsperpage;
      const endindex = startindex + itemsperpage;
      const totalpages = Math.ceil(categories.length / 6);
      const currentproduct = categories.slice(startindex,endindex);
      res.render("admin/category", {
        categories: currentproduct,
        totalpages,
        currentpage,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

const catCreation = async (req, res) => {
  const cat = req.body;
  const catNamePattern = new RegExp(`^${cat.name}$`, "i");
  await categories
    .findOne({ name: catNamePattern })
    .lean()
    .then(async (data) => {
      if (!data) {
        const create = new categories({
          name: cat.name,
          description: cat.description,
          image: req.file.filename,
        });
        create
          .save()
          .then((data) => {
            res.redirect("/admin/admin-category");
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        await categories
        .find()
        .lean()
        .then((categories) => {
          categories.reverse()
          const itemsperpage = 6;
          const currentpage = parseInt(req.query.page) || 1;
          const startindex = (currentpage - 1) * itemsperpage;
          const endindex = startindex + itemsperpage;
          const totalpages = Math.ceil(categories.length / 6);
          const currentproduct = categories.slice(startindex,endindex);
          res.render("admin/category", {
            categories: currentproduct,
            totalpages,
            currentpage,
            Already:"Category Already Exist"

          })
        })
      }
    });
}

const editCategoryPage = async (req, res) => {
  id = req.params.id;
  await categories
    .find({ _id: id })
    .lean()
    .then((data) => {
      res.render("admin/edit-category", {
        cat: data,
        catExist: req.session.catExist,
      });
      req.session.catExist = false;
    })
    .catch((err) => {
      console.log(err);
    });
};

const editCategory = async (req, res) => {
  var id = req.body.id;

  try {
    const existingCategory = await categories
      .findOne({
        name: { $regex: new RegExp(req.body.name, "i") },
      })
      .lean();

    if (!existingCategory || existingCategory.name==req.body.name && existingCategory.name.length==2) {
      const updateData = {
        name: req.body.name,
        description: req.body.description,
      }

      if (req.file) {
        updateData.image = req.file.filename;
      }
      const updatedCategory = await categories
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();

      if (!updatedCategory) {
        return res.status(404).send("Category not found");
      }

      return res.redirect("/admin/admin-category");
    } else {
      req.session.catExist = true;
      return res.redirect(`/admin/edit-category/${id}`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

const unlistCategory =async (req, res) => {
  id = req.query.userId;
  await categories
    .findByIdAndUpdate(id, { verified: "1" })
      var x=await product.updateMany({category:req.query.cat},{isListed:'1'},{new:true})
      res.redirect("/admin/admin-category");
}

const listCategory =async (req, res) => {
  id = req.query.userId;
  await categories
    .findByIdAndUpdate(id, { verified: "0" })
      var x=await product.updateMany({category:req.query.cat},{isListed:'0'},{new:true})
      res.redirect("/admin/admin-category");
}

const productDisplay = async (req, res) => {
  try {
    const allCategories = await categories.find({}).lean();
    const search = req.query.search || '';
    const searchQuery = {
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: 'i' } },
        { saleprice: { $regex: ".*" + search + ".*", $options: 'i' } },
      ],
    };
    const totalProducts = await product.countDocuments(searchQuery);
    const products = await product

      .find(searchQuery)
      products.reverse()
      const itemsperpage = 6;
      const currentpage = parseInt(req.query.page) || 1;
      const startindex = (currentpage - 1) * itemsperpage;
      const endindex = startindex + itemsperpage;
      const totalpages = Math.ceil(products.length / 6);
      const currentproduct = products.slice(startindex,endindex);

    res.render("admin/products", {
      product: currentproduct,
      cat: allCategories,
      currentPage:currentproduct,
      totalPages:totalpages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


const addProductPage = async (req, res) => {
  await categories.find({}).then((data) => {
    res.render("admin/add-products", { data: data });
  });
};

const addProduct = async (req, res) => {
  var x = req.body.size;
  var create = await new product({
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    subCategory:req.body.subCategory,
    regularprice: req.body.regularprice,
    saleprice: req.body.saleprice,
    createdon: Date.now(),
    color:req.body.color,
    taxrate: req.body.taxrate,
    units: req.body.units,
    size: x,
    image: [
      req.files[0].filename,
      req.files[1].filename,
      req.files[2].filename,
      req.files[3].filename,
    ],
  });
  await create
    .save()
    .then((data) => {
      res.redirect("/admin/admin-products");
    })
    .catch((err) => {
      console.log(err);
    });
};

const deleteProduct = async (req, res) => {
  const id = req.params.id;
  await product
    .findByIdAndDelete({ _id: id })
    .then((data) => {
      res.redirect("/admin/admin-products");
    })
    .catch((err) => {
      console.log(err);
    });
};

const editProductPage = async (req, res) => {
  var id = req.params.id;
  await categories
    .find({})
    .lean()
    .then((data) => {
      var cat = data;
      product
        .findById({ _id: id })
        .lean()
        .then((data) => {
          res.render("admin/edit-product", { data: data, cat: cat });
        })
        .catch((err) => {
          console.log(err);
        });
    });
};

const editProduct = async (req, res) => {
  var id = req.body.id;
  var size = req.body.size;
  if (req.files != 0) {
    await product.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        description: req.body.description,
        regularprice: req.body.Rprice,
        saleprice: req.body.Pprice,
        units: req.body.unit,
        taxrate: req.body.taxrate,
        category: req.body.category,
        color:req.body.color,
        subCategory:req.body.subCategory,
        image: [
          req.files[0].filename,
          req.files[1].filename,
          req.files[2].filename,
          req.files[3].filename,
        ],
      },
      { new: true }
    );
    res.redirect("/admin/admin-products");
  } else {
    await product.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        description: req.body.description,
        regularprice: req.body.Rprice,
        saleprice: req.body.Pprice,
        units: req.body.unit,
        taxrate: req.body.taxrate,
        category: req.body.category,
        color:req.body.color,
        subCategory:req.body.subCategory,
      },
      { new: true }
    );
    res.redirect("/admin/admin-products");
  }
};

const users = (req, res) => {
  user
    .find({ isadmin: "0" })
    .lean()
    .then((data) => {
      const itemsperpage = 5;
      const currentpage = parseInt(req.query.page) || 1;
      const startindex = (currentpage - 1) * itemsperpage;
      const endindex = startindex + itemsperpage;
      const totalpages = Math.ceil(data.length / 5);
      const user = data.slice(startindex,endindex);
      res.render("admin/users", { user ,totalpages,currentpage});
    })
    .catch((err) => {
      console.log(err);
    });
};

const blockUser = async (req, res) => {
  id = req.params.id;
  await user.findByIdAndUpdate(id, { verified: "1" }).then((data) => {
    res.redirect("/admin/users");
  });
};

const unblockUser = async (req, res) => {
  id = req.params.id;
  await user.findByIdAndUpdate(id, { verified: "0" }).then((data) => {
    res.redirect("/admin/users");
  });
};

const unlistUser = async (req, res) => {
  id = req.params.id;
  await product.findByIdAndUpdate(id, { verified: "1" }).then((data) => {
    res.redirect("/admin/admin-products");
  });
};

const listUser = async (req, res) => {
  id = req.params.id;
  await product.findByIdAndUpdate(id, { verified: "0" }).then((data) => {
    res.redirect("/admin/admin-products");
  });
};

const orders = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = 20;
    const search = req.query.search || '';
    const searchQuery = {
      $or: [
        { "address.number": { $regex: ".*" + search + ".*", $options: 'i' } },
        { "address.name": { $regex: ".*" + search + ".*", $options: 'i' } },
      ],
    };
    const totalProducts = await order.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    const data = await order
      .find(searchQuery)
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .sort({ createdOn: -1 })
      .lean();

    res.render("admin/orders", { data, currentPage, totalPages, search });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error'); // Handle the error appropriately
  }
};

const invoice= async(req,res)=>{
  try {
      const doc = new PDFDocument();
      const filename = 'sales-report.pdf';
      const orders = req.body;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      doc.pipe(res);
      doc.fontSize(12);
      doc.text('Sales Report', { align: 'center', fontSize: 16 });
      const margin = 5;
      doc
        .moveTo(margin, margin) // Top-left corner (x, y)
        .lineTo(600 - margin, margin) // Top-right corner (x, y)
        .lineTo(600 - margin, 842 - margin) // Bottom-right corner (x, y)
        .lineTo(margin, 842 - margin) // Bottom-left corner (x, y)
        .lineTo(margin, margin) // Back to top-left to close the rectangle
        .lineTo(600 - margin, margin) // Draw line across the bottom edge
        .lineWidth(3)
        .strokeColor('#000000')
        .stroke();
      
      doc.moveDown();
      
      // Define table headers with 4 columns
      const headers = ['Order ID', 'Name', 'Date', 'Total']; // Add the new column header
      
      // Calculate position for headers
      let headerX = 20;
      const headerY = doc.y + 10;
      
      // Adjust the spacing for the "Order ID" column to give it more space
      doc.text(headers[0], headerX, headerY); // Adjusted position for "Order ID" header
      headerX += 200; // Adjust spacing for the remaining headers
      
      // Draw headers for the other columns
      headers.slice(1).forEach(header => {
        doc.text(header, headerX, headerY);
        headerX += 130; // Adjust spacing as needed for the remaining headers
      });
      
      // Calculate position for data
      let dataY = headerY + 25;
      
      // Loop through your data and add rows to the table with the new column values
      orders.forEach(order => {
        doc.text(order.orderId, 20, dataY); // Adjusted position for "Order ID" data
        doc.text(order.name, 210, dataY);
        doc.text(order.date, 350, dataY);
        doc.text(order.totalAmount, 480, dataY);
        dataY += 30; // Adjust vertical spacing as needed

      });
      
      doc.end();
  } catch (error) {
      console.log(error.message);
  }
}

const cancelOrder = async (req, res) => {
  await order
    .updateOne({ _id: req.body.id }, { status: "-1" })
    .then((data) => {
      res.json(true);
    })
    .catch((err) => {
      console.log(err);
      res.json(false);
    });
};

const makeOrder = async (req, res) => {
  await order
    .updateOne({ _id: req.body.id }, { status: "0" })
    .then((data) => {
      res.json(true);
    })
    .catch((err) => {
      console.log(err);
      res.json(false);
    });
};

const approved = async (req, res) => {
  await order
    .updateOne({ _id: req.body.id }, { status: "1" })
    .then((data) => {
      res.json(true);
    })
    .catch((err) => {
      console.log(err);
      res.json(false);
    })
}

const orderDetails = async (req, res) => {
  var orderId = req.query.id;
  var oid = new mongodb.ObjectId(orderId);
  var Details = await order.aggregate([
    { $match: { _id: oid } },
    { $unwind: "$product" },
    {
      $project: {
        proId: { $toObjectId: "$product.productId" },
        totalPrice: "$totalPrice",
        status: "$status",
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
  order
    .find({ _id: orderId })
    .lean()
    .then((data) => {
      res.render("admin/order-details", {
        data: data,
        details: Details,
        pDetails: Details.ProductDetails,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

const delivered = async (req, res) => {
  await order
    .updateOne({ _id: req.body.id }, { status: "2" })
    .then((data) => {
      res.json(true);
    })
    .catch((err) => {
      console.log(err);
      res.json(false);
    });
};

const orderStatus=async (req,res)=>{
  if(req.query.status=="all"){
     res.redirect('/admin/admin-orders')
  }else{
      var data=await order.find({status:req.query.status}).lean()
  }
      res.render('admin/orders',{data:data})  
}

const changeStatus=async(req,res)=>{
  await order.findByIdAndUpdate(req.query.id,{$set:{status:req.query.status}}).lean()
  .then((data)=>{
    res.redirect(`/admin/details?id=${req.query.id}`)
  })
}

const logOut = (req, res) => {
  req.session.adminLoggedIn = null;
  req.session.emilErr = false;
  res.redirect("/admin/admin-login");
};

module.exports = {
  adminLoggin,
  monthlyreport,
  adminIndex,
  graph,
  loginConfirm,
  dashboard,
  orders,
  invoice,
  cancelOrder,
  makeOrder,
  approved,
  orderDetails,
  delivered,
  adminCategory,
  catCreation,
  editCategoryPage,
  editCategory,
  productDisplay,
  addProductPage,
  addProduct,
  deleteProduct,
  editProductPage,
  editProduct,
  users,
  blockUser,
  unblockUser,
  unlistCategory,
  listCategory,
  logOut,
  unlistUser,
  listUser,
  changeStatus,
  orderStatus
};
