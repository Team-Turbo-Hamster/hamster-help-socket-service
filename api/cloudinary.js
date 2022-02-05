const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImages = async (images, preset) => {
  // const uploadedImages = [];

  // for (image in images) {
  //   const img = await cloudinary.uploader.upload(image, {
  //     upload_preset: preset,
  //   });

  //   uploadedImages.push(img.public_id);
  // }
  const uploadedImages = await Promise.all(
    images.map(async (image) => {
      const img = await cloudinary.uploader.upload(image, {
        upload_preset: preset,
      });

      return img.public_id;
    })
  );

  return uploadedImages;
};

module.exports = { uploadImages };
