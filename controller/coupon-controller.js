
const order = require("../model/order-model");
const product = require("../model/products-model");
const user = require("../model/user-model");
const coupon = require("../model/coupon-model")
const voucher_codes = require('voucher-code-generator');
const { request } = require("express");
const cron = require('node-cron');


cron.schedule('0 0 * * *', async () => {
    try {
      const currentDate = new Date();
      // Find coupons with expiry dates in the past and status 1 (active).
      const expiredCoupons = await coupon.find({
        expiry: { $lt: currentDate },
        status: 1,
      });
  
      if (expiredCoupons.length > 0) {
        // Update the status of expired coupons to 2 (expired).
        await coupon.updateMany(
          { _id: { $in: expiredCoupons.map((c) => c._id) } },
          { $set: { status: 2 } }
        );
        console.log('Updated status of expired coupons.');
      }
    } catch (error) {
      console.error('Error updating coupon status:', error);
    }
  });

const coupons=async (req,res)=>{

    await coupon.find().lean()
    .then((data)=>{
        data.reverse()
        const itemsperpage = 5;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(data.length / 5);
        const currentCoupons = data.slice(startindex,endindex);
        res.render('admin/coupon',{data:currentCoupons,totalpages,currentpage})
    })
}

const couponAdded= async (req, res) => {
    const formattedStartDate = req.body.startDate.split('-').reverse().join('/');
    const formattedEndDate = req.body.endDate.split('-').reverse().join('/');
    let code=voucher_codes.generate({
        prefix: "promo-",
        postfix: "-2015"
    })
    let exist=await coupon.find({name:req.body.name},{new:true})
    console.log(exist,"exist");
    if(exist.length){
        await coupon.find().lean()
        .then((data)=>{
            res.render('admin/coupon',{data:data,err:"Coupon Already Exist"})
        })
    }else{
        const create = new coupon({
        name: req.body.name,
        code:code,
        created: formattedStartDate,
        expiry: formattedEndDate,
        offerPrice: req.body.offerPrice,
        minimumPrice: req.body.minimumPrice,
        status:1
    })
    create.save()
        .then((data) => {
            res.redirect('/admin/coupon');
        })
    }
}

const couponStatus=async (req,res)=>{
    console.log(req.body);
    const id=req.body.id
    const status=req.body.status
    console.log(status);
    await coupon.findByIdAndUpdate(id,{status:status},{new:true}).lean()
    .then((data)=>{
        console.log(data);
        res.json(true)
    })
}

module.exports={
    coupons,
    couponAdded,
    couponStatus
}