// const sharp = require('sharp');

// async function cropImage(req, res, next) {
//   try {
//     const cropLeft = 100;    // Starting X-coordinate of the crop
//     const cropTop = 100;     // Starting Y-coordinate of the crop
//     const cropWidth = 3600;   // Width of the crop
//     const cropHeight = 2400;  // Height of the crop

//     if (!req.file) {
//       throw new Error('No image file uploaded.');
//     }

//     const croppedBuffer = await sharp(req.file.path)
//       .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
//       .toBuffer();

//     req.croppedImageBuffer = croppedBuffer; // Store the cropped image buffer in the request object

//     next(); // Move to the next middleware or route
//   } catch (error) {
//     console.error('Error cropping image:', error);
//     res.status(500).json({ error: 'Image cropping failed.' });
//   }
// }
// module.exports = {
//   cropImage
// };