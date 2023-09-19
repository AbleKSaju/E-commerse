const { log } = require("debug/src/node");
const order = require("../model/order-model");
const product = require("../model/products-model");

const salesReport = (req, res) => {
  console.log(req.query.day);
  if (req.query.day) {
    res.redirect(`/admin/${req.query.day}`);
  } else {
    res.redirect(`/admin/salesToday`);
  }
};


const salesToday = async (req, res) => {
  let todaysales = new Date();
  const startOfDay = new Date(
    todaysales.getFullYear(),
    todaysales.getMonth(),
    todaysales.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfDay = new Date(
    todaysales.getFullYear(),
    todaysales.getMonth(),
    todaysales.getDate(),
    23,
    59,
    59,
    999
  );
  try {
    const orders = await order
      .aggregate([
        {
          $match: {
            createdOn: {
              $gte: startOfDay,
              $lt: endOfDay,
            },
            status: "2",
          },
        },
      ])
      .sort({ createdOn: -1 });
    // const productIds = orders.map((order) => order.product.productId);
    // const products = await product.find({
    //   _id: { $in: productIds },
    // });
    console.log(orders);
    const itemsperpage = 10;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    const totalpages = Math.ceil(orders.length / 10);
    const currentproduct = orders.slice(startindex,endindex);
    res.render("admin/salesReport", {
      order: currentproduct,
      currentpage,
      totalpages,
      //product: products,
      salesToday: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

const salesWeekly = async (req, res) => {
  const currentDate = new Date();

        const startOfWeek = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() - currentDate.getDay()
        );
        const endOfWeek = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() + (6 - currentDate.getDay()),
            23,
            59,
            59,
            999
        );
  const orders = await order.aggregate([
    {
      $match: {
        createdOn: {
          $gte: startOfWeek,
          $lt: endOfWeek,
        },
        status: "2",
      },
    },  
    {
      $sort: { createdOn: -1 },
    },
  ]);
  console.log(orders,"odssss");
  const itemsperpage = 10;
  const currentpage = parseInt(req.query.page) || 1;
  const startindex = (currentpage - 1) * itemsperpage;
  const endindex = startindex + itemsperpage;
  const totalpages = Math.ceil(orders.length / 10);
  const currentproduct = orders.slice(startindex,endindex);
  res.render("admin/salesReport", { order: currentproduct, salesWeekly: true,totalpages,currentpage });
};
const salesMonthly = async (req, res) => {
  const thisMonth = new Date().getMonth() + 1;
  const startofMonth = new Date(
    new Date().getFullYear(),
    thisMonth - 1,
    1,
    0,
    0,
    0,
    0
  );
  const endofMonth = new Date(
    new Date().getFullYear(),
    thisMonth,
    0,
    23,
    59,
    59,
    999
  );

  try {
    const orders = await order
      .aggregate([
        {
          $match: {
            createdOn: {
              $gte: startofMonth,
              $lt: endofMonth,
            },
            status: "2",
          },
        },
      ])
      .sort({ createdOn: -1 });
    // const productIds = orders.map((order) => order.product.productId);
    // const products = await product.find({
    //   _id: { $in: productIds },
    // });
    const itemsperpage = 10;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    const totalpages = Math.ceil(orders.length / 10);
    const currentproduct = orders.slice(startindex,endindex);
    res.render("admin/salesReport", {
      order: currentproduct,
      totalpages,
      currentpage,
      salesMonthly: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

const salesYearly = async (req, res) => {
  const today = new Date().getFullYear();
  const startofYear = new Date(today, 0, 1, 0, 0, 0, 0);
  const endofYear = new Date(today, 11, 31, 23, 59, 59, 999);

  try {
    const orders = await order
      .aggregate([
        {
          $match: {
            createdOn: {
              $gte: startofYear,
              $lt: endofYear,
            },
            status: "2",
          },
        },
      ])
      .sort({ createdOn: -1 });
    // const productIds = orders.map((order) => order.product.productId);
    // const products = await product.find({
    //   _id: { $in: productIds },
    // });
    const itemsperpage = 10;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    const totalpages = Math.ceil(orders.length / 10);
    const currentproduct = orders.slice(startindex,endindex);
    res.render("admin/salesReport", {
      order: currentproduct,
      totalpages,
      currentpage,
      // product: products,
      salesYearly: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  salesReport,
  salesToday,
  salesMonthly,
  salesWeekly,
  salesYearly,
};
