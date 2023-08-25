const { productDetails } = require("./user-controller");
const user = require("../model/user-model");
const product = require("../model/products-model");
const categories = require("../model/category-model");
const bcrypt = require("bcrypt");
const { log } = require("debug/src/browser");

const adminLoggin = (req, res) => {
  res.render("admin/login", {
    email: req.session.emilErr,
    pass: req.session.pasErr,
    notAdmin: req.session.notAdmin,
  });
};

const adminIndex = (req, res) => {
  if (req.session.adminLoggedIn == true) {
    res.render("admin/dashboard");
  } else {
    res.redirect("/admin/admin-login");
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
      res.render("admin/category", {
        categories: categories,
        already: req.session.Already,
      });
      req.session.Already = false;
    })
    .catch((err) => {
      console.log(err);
    });
};

// const catCreation = async (req, res) => {
//   var cat = req.body;
//   await categories.find({name:cat.name}).lean()
//   .then((data)=>{
//     if(data.length==0){
//       let create =  new categories({
//         name: cat.name,
//         description: cat.description,
//         unit: cat.unit,
//         image: req.file.filename,
//       });
//       create
//         .save()
//         .then((data) => {
//           res.redirect("/admin/admin-category");
//         })
//         .catch((err) => {
//           console.log(err)
//         })
//     }else{
//       req.session.Already=true
//       res.redirect('/admin/admin-category')
//     }
//   })
// }

const catCreation = async (req, res) => {
  const cat = req.body;
  const catNamePattern = new RegExp(`^${cat.name}$`, "i");
  console.log(catNamePattern, "cat");
  await categories
    .findOne({ name: catNamePattern })
    .lean()
    .then((data) => {
      if (!data) {
        const create = new categories({
          name: cat.name,
          description: cat.description,
          unit: cat.unit,
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
        req.session.Already = true;
        res.redirect("/admin/admin-category");
      }
    });
};

const deleteCategory = async (req, res) => {
  var id = req.params.id;
  try {
    await categories.findOneAndDelete({ _id: id });
    res.redirect("/admin/admin-category");
  } catch (error) {
    console.log(error);
  }
};

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

// const editCategory = async (req, res) => {
//   var id = req.body.id;
//   console.log(req.body,"Body");
//   await categories
//     .find({ name: req.body.name })
//     .lean()
//     .then((data) => {
//       console.log(data.name);
//       if (!data.name) {
//         console.log("ooooooo");
//         if (req.file) {
//           console.log("file");
//           categories.findByIdAndUpdate(
//             id,
//             {
//               name: req.body.name,
//               description: req.body.description,
//               image: req.file.filename,
//             },
//             { new: true }
//           );
//           res.redirect("/admin/admin-category");
//         } else {
//           console.log("nofile");
//           categories.findByIdAndUpdate(
//             id,
//             {
//               name: req.body.name,
//               description: req.body.description,
//             },
//             { new: true }
//           );
//           res.redirect("/admin/admin-category");
//         }
//       } else {
//         console.log("elsee");
//         req.session.catExist = true;
//         res.redirect(`/admin/edit-category/${id}`);
//       }
//     });
// };

const editCategory = async (req, res) => {
  var id = req.body.id;

  try {
    // Use a regular expression with 'i' flag for case-insensitive matching
    const existingCategory = await categories.findOne({
      name: { $regex: new RegExp(req.body.name, 'i') },
    }).lean();

    if (!existingCategory) {
      const updateData = {
        name: req.body.name,
        description: req.body.description,
      };

      if (req.file) {
        updateData.image = req.file.filename;
      }

      // Use findByIdAndUpdate and exec to update the document
      const updatedCategory = await categories
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();

      if (!updatedCategory) {
        return res.status(404).send('Category not found');
      }

      return res.redirect("/admin/admin-category");
    } else {
      req.session.catExist = true;
      return res.redirect(`/admin/edit-category/${id}`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

const unlistCategory = (req, res) => {
  id = req.params.id;
  console.log(id);
  categories
    .findByIdAndUpdate(id, { verified: "1" })
    .then((data) => {
      res.redirect("/admin/admin-category");
    })
    .catch((err) => {
      console.log(err);
    });
};

const listCategory = (req, res) => {
  id = req.params.id;
  categories
    .findByIdAndUpdate(id, { verified: "0" })
    .then((data) => {
      res.redirect("/admin/admin-category");
    })
    .catch((err) => {
      console.log(err);
    });
};

const productDisplay = async (req, res) => {
  await categories.find({}).then((cat) => {
    product.find({}).then((data) => {
      res.render("admin/products", { product: data, cat: cat });
    });
  });
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
    regularprice: req.body.regularprice,
    saleprice: req.body.saleprice,
    createdon: Date.now(),
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
  console.log(req.body);
  var id = req.body.id;
  var size = req.body.size;
  if (req.files != 0) {
    await product.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        description: req.body.description,
        regularprice: req.body.regularprice,
        saleprice: req.body.saleprice,
        units: req.body.units,
        taxrate: req.body.taxrate,
        size: size,
        category: req.body.category,
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
        regularprice: req.body.regularprice,
        saleprice: req.body.saleprice,
        units: req.body.units,
        taxrate: req.body.taxrate,
        size: size,
        category: req.body.category,
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
      res.render("admin/users", { user: data });
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

const logOut = (req, res) => {
  req.session.adminLoggedIn = null;
  req.session.emilErr = false;
  res.redirect("/admin/admin-login");
};

module.exports = {
  adminLoggin,
  adminIndex,
  loginConfirm,
  dashboard,
  adminCategory,
  deleteCategory,
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
};
