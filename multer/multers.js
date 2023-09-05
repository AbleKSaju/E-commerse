const multer = require("multer");

const { log } = require("debug/src/node")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, "public/uploads/categories")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname)
  },
})


const products = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, "public/uploads/products");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname)
  },
})

const bannerManagement =multer.diskStorage({
  destination:(req, file,cb)=>{
    return cb(null, "public/uploads/banner")
  },
  filename:(req, file, cb)=>{
    cb(null, Date.now() + file.originalname)
  }
})

const update = multer({ storage: products });
const upload = multer({ storage: storage });
const banner = multer({ storage: bannerManagement})

module.exports = {
  update,
  upload,
  banner
};
