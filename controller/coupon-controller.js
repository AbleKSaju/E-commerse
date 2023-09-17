
const order = require("../model/order-model");
const product = require("../model/products-model");
const user = require("../model/user-model");
const coupon = require("../model/coupon-model")
const voucher_codes = require('voucher-code-generator');
const { request } = require("express");

const coupons=async (req,res)=>{
    await coupon.find().lean()
    .then((data)=>{
        res.render('admin/coupon',{data:data})
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
    if(exist){
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