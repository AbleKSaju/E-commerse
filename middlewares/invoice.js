const users = require("../model/user-model");
const nodemailer = require("nodemailer");
const mongodb = require("mongodb");
const orderModel = require("../model/order-model");
const { log } = require("debug/src/browser");
const easyinvoice = require('easyinvoice');
const { Readable } = require("stream");
const banner = require("../model/banner-model");
const Razorpay = require("razorpay");

require("dotenv").config();
 
const invoice=async(req,res)=>{
  try {
          const id = req.query.id;
          const userId = req.session.user;
          const result = await orderModel.findOne({ _id: id }); 
          const user = await users.findOne({ _id: userId });      
          const address = result.address
          const order = {
            id: id,
            total: result.totalPrice,
            date: result.createdOn, // Use the formatted date
            paymentMethod: result.payment,
            orderStatus: result.status,
            name: address[0].name,
            number: address[0].number,
            house:address[0].house,
            pincode: address[0].pinCode,
            town: address[0].town,
            state: address[0].state,
            product: result.product,
          };
          //set up the product
          let oid = new mongodb.ObjectId(id)
          let Pname =  await orderModel.aggregate([
              {$match:{_id:oid}},
              {$unwind:'$product'},
              {$project:{
                  proId:{$toObjectId:'$product.productId'},
                  quantity:'$products.quantity',
                  Size:'$product.size',
                  totalPrice:'$totalPrice'  
              }},
              {$lookup:{ 
                  from:'products',
                  localField:'proId',
                  foreignField:'_id',
                  as:'ProductDetails',
              }},
              {
                  $project: {
                      quantity: '$quantity',
                      description: { $arrayElemAt: ['$ProductDetails.name', 0] },
                      price: { $arrayElemAt: ['$ProductDetails.saleprice', 0] },
                      total: '$totalPrice',
                      "tax-rate": '1',
                      _id:0
                  }
              }
          ])
          const products = order.product.map((product,i) => ({
                  quantity: parseInt(product.quantity),
                  description: Pname[i].description,
                  price: parseInt(Pname[i].price),
                  total: parseInt(result.totalPrice),
                  "tax-rate": 0,
                }));
          
          
          console.log(order,'ooo');
          console.log(Pname,'ooo');
          const isoDateString = order.date;
          const isoDate = new Date(isoDateString);
      
          const options = { year: "numeric", month: "long", day: "numeric" };
          const formattedDate = isoDate.toLocaleDateString("en-US", options);
          const data = {
            customize: {
              //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
            },
            images: {
              // The invoice background
              background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
            },
            // Your own data
            sender: {
              company: "Stepz",
              address: "Stepz Shop Kochi",
              city: "Ernakulam",
              country: "India",
            },
            client: {
              company: "Customer Address",
              "zip": order.name,
              "city": order.house,
              "address": order.pincode,
              // "custom1": "custom value 1",
              // "custom2": "custom value 2",
              // "custom3": "custom value 3"
            },
            information: {
              number: "order" + order.id,
              date: formattedDate,
            },
            products: products,
            "bottom-notice": "Happy shoping and visit Stepz again",
          };
      let pdfResult = await easyinvoice.createInvoice(data);
          const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");
      
          // Set HTTP headers for the PDF response
          res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
          res.setHeader("Content-Type", "application/pdf");
      
          // Create a readable stream from the PDF buffer and pipe it to the response
          const pdfStream = new Readable();
          pdfStream.push(pdfBuffer);
          pdfStream.push(null);
      
          pdfStream.pipe(res);
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: error.message });
        }
}

module.exports={
  invoice
}

// const generateAndSendInvoice = async (req, res,orderId,userEmail) => {
//     try {
//       console.log("ente5r");
//       console.log(orderId,"oid");
//       console.log(userEmail);
//               const id = orderId;
//              // console.log(id,"id");
//               const result = await order.findOne({ _id: id });
//              // console.log("Resultt" , result)
//               const userData = await user.findOne({ _id: result.userId });
//               //console.log("User:",userData);
//               const address = result.address
//               //console.log(address);
//               const orders = {
//                 id: id,
//                 total: result.totalPrice,
//                 date: result.createdOn, // Use the formatted date
//                 paymentMethod: result.payment,
//                 orderStatus: result.status,
//                 name: address[0].name,
//                 number: address[0].number,
//                 pincode: address[0].pinCode,
//                 town: address[0].town,
//                 state: address[0].state,
//                 items: result.product,
//               };
//               // console.log("ORdersss:",orders)
//               let oid = new mongodb.ObjectId(orders.id)
//               let Pname =  await order.aggregate([
//                 {$match:{_id:oid}},
//                 {$unwind:'$product'},
//                 {$project:{
//                   productId:{$toObjectId:'$product.productId'},
//                     quantity:'$product.quantity',
//                     Size:'$product.size',
//                     totalPrice:'$totalPrice'  
//                 }},
//                 {$lookup:{ 
//                     from:'products',
//                     localField:'productId',
//                     foreignField:'_id',
//                     as:'ProductDetails',
//                 }},
//                 {
//                     $project: {
//                         quantity: '$quantity',
//                         description: { $arrayElemAt: ['$ProductDetails.name', 0] },
//                         price: { $arrayElemAt: ['$ProductDetails.saleprice', 0] },
//                         total: '$totalPrice',
//                         "tax-rate": '1',
//                         _id:0
//                     }
//                 }
//             ])
//             console.log("Pnameee:" , Pname)
      
//               //set up the product
//               const products = orders.items.map((product,i) => ({
//                 quantity: parseInt(product.quantity),
//                 description: Pname[i].description,
//                 // price: parseInt(product.price),
//                 total: result.totalPrice,
//                 "tax-rate": 0,
//               }));
//               console.log(products,"pppp");
//               const isoDateString = orders.date;
//               console.log(isoDateString,"date");
//               const isoDate = new Date(isoDateString);
//               console.log(isoDate,"daa");
          
//               const options = { year: "numeric", month: "long", day: "numeric" };
//               console.log(options,"op");
//               const formattedDate = isoDate.toLocaleDateString("en-US", options);
//               console.log(formattedDate,"fd");
//               const data = {
//                 customize: {
//                   //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
//                 },
//                 images: {
//                   // The invoice background
//                   background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
//                 },
//                 // Your own data
//                 sender: {
//                   company: "Shoe Shop",
//                   address: "Kalappurackal PO,Ernakulam",
//                   city: "Ernakulam",
//                   country: "India",
//                 },
//                 client: {
//                   company: "Customer Address",
//                   "zip": orders.pincode,
//                   "city": orders.town,
//                   "address": orders.state,
//                   // "custom1": "custom value 1",
//                   // "custom2": "custom value 2",
//                   // "custom3": "custom value 3"
//                 },
//                 information: {
//                   // Invoice number
//                   number:  orders.id,
//                   // ordered date
//                   date: formattedDate,
//                 },
//                 products: products,
//                 "bottom-notice": "Happy shoping and visit Shoe shop again",
//               };
//               console.log(data,"dta");
          
//               const pdfResult = await easyinvoice.createInvoice(data);
//               console.log("hi");
//               console.log(pdfResult);
//               const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");
//               console.log(pdfBuffer);
//               console.log("uuu");
//               // require('dotenv').config();
//               const transporter = nodemailer.createTransport({
//                   service:'gmail',
//                   auth:{
//                       user:"ableksaju3@gmail.com",
//                       pass:"jxvshrcnlmpaxxqc",
//                   }
//               })
//               console.log("oi")
  
//       const mailOptions = {
//         from: "ableksaju3@gmail.com", // Sender's email address
//         to: userEmail, // Recipient's email address
//         subject: "Invoice", // Email subject
//         text: "Please find the attached invoice.", // Email body text
//         attachments: [
//           {
//             filename: "invoice.pdf", // Name of the attached file
//             content: pdfBuffer, // The PDF content as buffer
//           },
//         ],
//       };
//       console.log("hi");
//       console.log(mailOptions,"mo");
  
//       // Send email
//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.log("Email error:", error);
//         } else {
//           console.log("Email sent:", info.response);
//         //   res.status(200).json({ message: "Invoice sent successfully" });
//         return true
//         }
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: error.message });
//     } 
//   };

//   const generateAndSendInvoices = async (req, res,orderId,userEmail) => {
//     try {
//       console.log("ente5r");
//       console.log(orderId,"oid");
//       console.log(userEmail);
//               const id = orderId;
//              // console.log(id,"id");
//               const result = await order.findOne({ _id: id });
//              // console.log("Resultt" , result)
//               const userData = await user.findOne({ _id: result.userId });
//               //console.log("User:",userData);
//               const address = result.address
//               //console.log(address);
//               const orders = {
//                 id: id,
//                 total: result.totalPrice,
//                 date: result.createdOn, // Use the formatted date
//                 paymentMethod: result.payment,
//                 orderStatus: result.status,
//                 name: address[0].name,
//                 number: address[0].number,
//                 pincode: address[0].pinCode,
//                 town: address[0].town,
//                 state: address[0].state,
//                 items: result.product,
//               };
//               // console.log("ORdersss:",orders)
//               let oid = new mongodb.ObjectId(orders.id)
//               let Pname =  await order.aggregate([
//                 {$match:{_id:oid}},
//                 {$unwind:'$product'},
//                 {$project:{
//                   productId:{$toObjectId:'$product.productId'},
//                     quantity:'$product.quantity',
//                     Size:'$product.size',
//                     totalPrice:'$totalPrice'  
//                 }},
//                 {$lookup:{ 
//                     from:'products',
//                     localField:'productId',
//                     foreignField:'_id',
//                     as:'ProductDetails',
//                 }},
//                 {
//                     $project: {
//                         quantity: '$quantity',
//                         description: { $arrayElemAt: ['$ProductDetails.name', 0] },
//                         price: { $arrayElemAt: ['$ProductDetails.saleprice', 0] },
//                         total: '$totalPrice',
//                         "tax-rate": '1',
//                         _id:0
//                     }
//                 }
//             ])
//             console.log("Pnameee:" , Pname)
      
//               //set up the product
//               const products = orders.items.map((product,i) => ({
//                 quantity: parseInt(product.quantity),
//                 description: Pname[i].description,
//                 // price: parseInt(product.price),
//                 total: result.totalPrice,
//                 "tax-rate": 0,
//               }));
//               console.log(products,"pppp");
//               const isoDateString = orders.date;
//               console.log(isoDateString,"date");
//               const isoDate = new Date(isoDateString);
//               console.log(isoDate,"daa");
          
//               const options = { year: "numeric", month: "long", day: "numeric" };
//               console.log(options,"op");
//               const formattedDate = isoDate.toLocaleDateString("en-US", options);
//               console.log(formattedDate,"fd");
//               const data = {
//                 customize: {
//                   //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
//                 },
//                 images: {
//                   // The invoice background
//                   background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
//                 },
//                 // Your own data
//                 sender: {
//                   company: "Shoe Shop",
//                   address: "Kalappurackal PO,Ernakulam",
//                   city: "Ernakulam",
//                   country: "India",
//                 },
//                 client: {
//                   company: "Customer Address",
//                   "zip": orders.pincode,
//                   "city": orders.town,
//                   "address": orders.state,
//                   // "custom1": "custom value 1",
//                   // "custom2": "custom value 2",
//                   // "custom3": "custom value 3"
//                 },
//                 information: {
//                   // Invoice number
//                   number:  orders.id,
//                   // ordered date
//                   date: formattedDate,
//                 },
//                 products: products,
//                 "bottom-notice": "Happy shoping and visit Shoe shop again",
//               };
//               console.log(data,"dta");
          
//               const pdfResult = await easyinvoice.createInvoice(data);
//               console.log("hi");
//               console.log(pdfResult);
//               const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");
//               console.log(pdfBuffer);
//               console.log("uuu");
//               // require('dotenv').config();
//               const transporter = nodemailer.createTransport({
//                   service:'gmail',
//                   auth:{
//                       user:"ableksaju3@gmail.com",
//                       pass:"jxvshrcnlmpaxxqc",
//                   }
//               })
//               console.log("oi")
  
//       const mailOptions = {
//         from: "ableksaju3@gmail.com", // Sender's email address
//         to: userEmail, // Recipient's email address
//         subject: "Invoice", // Email subject
//         text: "Please find the attached invoice.", // Email body text
//         attachments: [
//           {
//             filename: "invoice.pdf", // Name of the attached file
//             content: pdfBuffer, // The PDF content as buffer
//           },
//         ],
//       };
//       console.log("hi");
//       console.log(mailOptions,"mo");
  
//       // Send email
//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.log("Email error:", error);
//         } else {
//           console.log("Email sent:", info.response);
//         //   res.status(200).json({ message: "Invoice sent successfully" });
//         return true
//         }
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: error.message });
//     } 
//   };
//   module.exports={
//     generateAndSendInvoice,
//     generateAndSendInvoices
//   }