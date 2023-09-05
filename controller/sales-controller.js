const { log } = require("debug/src/node");
const order = require("../model/order-model");
const product = require("../model/products-model");

const salesReport=(req,res)=>{
    console.log(req.query.day);
    if(req.query.day){
        res.redirect(`/admin/${req.query.day}`)
    }else{
        res.redirect(`/admin/salesToday`)
    }
}

const salesToday=async (req, res) => {
    let todaysales = new Date()
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
        const orders = await order.aggregate([
            {
                $match: {
                    createdOn: {
                        $gte: startOfDay,
                        $lt: endOfDay
                    }
                }
            },
            // {
            //     $unwind: "$product"
            // }
        ]).sort({ createdOn: -1 });
        const productIds = orders.map(order => order.product.productId);
        const products = await product.find({
            _id: { $in: productIds }
        });

        res.render('admin/salesReport', { order: orders, product: products,salesToday:true });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

const salesWeekly=async (req, res) => {
    console.log("Entered");
    const currentDate = new Date();
    // const startOfWeek = new Date(
    //     currentDate.getFullYear(),
    //     currentDate.getMonth(),
    //     currentDate.getDate() - currentDate.getDay()
    // );
    // startOfWeek.setHours(0, 0, 0, 0); // Set to the beginning of the day
    const thisMonth = new Date().getMonth() + 1;
    const startOfWeek = new Date(
        new Date().getFullYear(),
        thisMonth - 1,
        1,
        0,
        0,
        0,
        0
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
                    $lt: endOfWeek
                }
            }
        },
        {
            $sort: { createdOn: -1 } 
        }
    ])
    console.log(orders);
      res.render('admin/salesReport', { order: orders,salesWeekly:true });
}

const salesMonthly=async(req,res)=>{
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
        const orders = await order.aggregate([
            {
                $match: {
                    createdOn: {
                        $gte: startofMonth,
                        $lt: endofMonth
                    }
                }
            },
            // {
            //     $unwind: "$product"
            // }
        ]).sort({ createdOn: -1 });
        const productIds = orders.map(order => order.product.productId);
        const products = await product.find({
            _id: { $in: productIds }
        });
        res.render('admin/salesReport', { order: orders, product: products,salesMonthly:true});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

const salesYearly=async(req,res)=>{
    const today = new Date().getFullYear();
    const startofYear = new Date(today, 0, 1, 0, 0, 0, 0);
    const endofYear = new Date(today, 11, 31, 23, 59, 59, 999);


    try {
        const orders = await order.aggregate([
            {
                $match: {
                    createdOn: {
                        $gte: startofYear,
                        $lt: endofYear
                    }
                }
            },
            // {
            //     $unwind: "$product"
            // }
        ]).sort({ createdOn: -1 });
        const productIds = orders.map(order => order.product.productId);
        const products = await product.find({
            _id: { $in: productIds }
        });
        res.render('admin/salesReport', { order: orders, product: products,salesYearly:true});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}




module.exports={
    salesReport,
    salesToday,
    salesMonthly,
    salesWeekly,
    salesYearly
}