
const sharp = require('sharp')
const fs = require('fs')

module.exports = {
    bannerCrop: (req, res, next) => { // Add 'next' parameter to indicate middleware continuation
        const inputFilePath = req.file.path;
        // Use sharp to read the input image
        sharp(inputFilePath)
            .resize(1600, 500)
            .toFormat('webp')
            .toBuffer((err, processedImageBuffer) => {
                if (err) {
                    console.error('Error while cropping the image:', err);
                    // Handle the error as needed
                    next(err); // Call 'next' with an error to skip subsequent middleware and invoke error handling middleware
                } else {
                    // Save the processed image back to the same file path
                    fs.writeFile(inputFilePath, processedImageBuffer, (writeErr) => {
                        if (writeErr) {
                            console.error('Error while saving the processed image:', writeErr);
                            // Handle the error as needed
                            next(writeErr); // Call 'next' with an error to skip subsequent middleware and invoke error handling middleware
                        } else {
                            console.log('Image cropped and saved successfully to:', inputFilePath);
                            // Continue with the next middleware or route handler
                            next();
                        }
                    });
                }
            });
    }
}