const crop = require("../middlewares/crop");
const bannerModel = require("../model/banner-model")
const categories=require("../model/category-model")
const { log } = require("debug/src/browser");
const { cancelOrder, logOut } = require("../controller/user-controller");

const bannerPage=async(req,res)=>{
    bannerModel.find().lean()
    .then((data)=>{
        data.reverse()
        const itemsperpage = 5;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(data.length / 5);
        const banner = data.slice(startindex,endindex);
        res.render('admin/banner',{data:banner,totalpages,currentpage})
    })
}

const addBanner=async(req,res)=>{
    var category=await categories.find().lean()
    res.render('admin/add-banner',{category})
}

const bannerAdded=(req,res)=>{
    const currentDate = new Date();
    const [year, month, day] = [
      currentDate.getFullYear(),
      (currentDate.getMonth() + 1).toString().padStart(2, "0"),
      currentDate.getDate().toString().padStart(2, "0"),
    ];
    var date = `${day} / ${month} / ${year}`;
    var newBanner=new bannerModel({
        title:req.body.name,
        description:req.body.description,
        location:req.body.location,
        link:req.body.link,
        image:req.file.filename,
        date:date
    })
    newBanner.save()
    res.redirect('/admin/bannerManagement')
}

const editBanner=async (req,res)=>{
    var category=await categories.find().lean()
    var data=await bannerModel.findOne({_id:req.params.id}).lean()
        res.render('admin/edit-banner',{data,category})

}

const bannerEdited=(req, res, next) => {
    const currentDate = new Date();
    const [year, month, day] = [
        currentDate.getFullYear(),
        (currentDate.getMonth() + 1).toString().padStart(2, "0"),
        currentDate.getDate().toString().padStart(2, "0"),
    ];
    const date = `${day} / ${month} / ${year}`;
    const updateFields = {
        title: req.body.name,
        description: req.body.description,
        location: req.body.location,
        link: req.body.link,
        date: date
    };
    if (req.file) {
        crop.bannerCrop(req, res, () => {
            updateFields.image = req.file.filename;
            proceedWithUpdate();
        });
    } else {
        proceedWithUpdate();
    }
    async function proceedWithUpdate() {
        await bannerModel.findByIdAndUpdate(req.query.id, updateFields);
        res.redirect('/admin/bannerManagement');
    }
}

const deleteBanner=async(req,res)=>{
    await bannerModel.findByIdAndRemove(req.params.id)
    .then((data)=>{
        res.redirect('/admin/bannerManagement')
    })
}

module.exports={
    addBanner,
    bannerPage,
    bannerAdded,
    bannerEdited,
    deleteBanner,
    editBanner
}