// user=require('../modal/user-modal')

// const loggedIn=((req,res,next)=>{
//     user.find({}).lean()
//     .then((data)=>{
//         console.log(data);
//         if(data.verified==0){
//             req.session.isloggedIn=true
//             res.redirect('/')
//             next()
//         }else{
//             res.redirect('/')
//             next()
//         }
//     })
// })

// module.exports={
//     loggedIn,
// }
// const user = require('../modal/user-modal');

// const loggedIn = (req, res, next) => {
 
//   user.find({}).lean()
//     .then((data) => {
//       console.log(data);
//       if (data.length === 0 || data[0].verified === 0) {
//         req.session.isloggedIn = true;
//         res.redirect('/');
//       } else {
//         next();
//       }
//     })
//     .catch((error) => {
//       console.error('Error finding user:', error);
//       next(); // Proceed to the next middleware
//     });
// };

// module.exports = {
//   loggedIn,
// };