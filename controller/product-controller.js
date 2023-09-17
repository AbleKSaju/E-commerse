const product = require("../model/products-model");
const categories = require("../model/category-model");
const banner = require("../model/banner-model");


const productShow = async (req, res) => {
    try {
      const banners = await banner.find({ location: "Products" }).lean();
      const allCategories = await categories.find().lean();
      const products = await product
        .find({ verified: "0" ,isListed: '0'})
        products.reverse();
        const itemsperpage = 6;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(products.length / 6);
        const currentproduct = products.slice(startindex,endindex);
      res.render("user/products", {
        banner: banners,
        data: allCategories,
        cat: "all",
        isLoggedIn: req.session.user,
        products:currentproduct,
        totalPages:totalpages,
        currentPage:currentpage,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const searchProduct = async (req, res) => {
    try {
      const banners = await banner.find({ location: "Products" }).lean();
      const search = req.query.search;
      const data = await categories.find().lean();
      const searchData = await product
        .find({
          $or: [
            {
              name: { $regex: ".*" + search + ".*", $options: "i" },
            },
            {
              saleprice: { $regex: ".*" + search + ".*", $options: "i" },
            },
          ],isListed: '0'
        })
        .lean();
      res.render("user/products", {
        products: searchData,
        cat: "all",
        isLoggedIn: req.session.user,
        data,
        totalPages: false,
        banner: banners,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const bradWise = async (req, res) => {
    const banners = await banner.find({ location: "Products" }).lean();
    var datas = await categories.find().lean()
    categories
      .find({ name: req.params.id })
      .lean()
      .then((data) => {
        var category = data;
        product
          .find({ category: req.params.id ,isListed: '0' })
          .lean()
          .then((data) => {
            data.reverse();
            const itemsperpage = 6;
            const currentpage = parseInt(req.query.page) || 1;
            const startindex = (currentpage - 1) * itemsperpage;
            const endindex = startindex + itemsperpage
            const totalpages = Math.ceil(data.length / 6);
            const currentproduct = data.slice(startindex,endindex);
            res.render("user/products", {
              data:datas,
              products: currentproduct,
              isLoggedIn: req.session.user,
              cat: category,
              totalPages:totalpages,
              currentPage:currentpage,
              banner: banners,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      });
  };
  
  const subCategory = async (req, res) => {
    const banners = await banner.find({ location: "Products" });
    const data = await categories.find().lean();
    await product
      .find({ subCategory: req.params.cat ,isListed: '0'})
      .lean()
      .then((datas) => {
        res.render("user/products", {
          products: datas,
          data,
          isLoggedIn: req.session.user,
          subCategory: req.params.cat,
          cat: null,
          totalPages: false,
          banner: banners,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  
  const productDetails = async (req, res) => {
    id = req.query.id;
    await product
      .find({ _id: id })
      .lean()
      .then((data) => {
        product
          .find()
          .lean()
          .then((products) => {
            res.render("user/product-display", {
              products: products,
              data: data,
              isLoggedIn: req.session.user,
            });
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  
module.exports={
    productShow,
    searchProduct,
    bradWise,
    subCategory,
    productDetails
  }