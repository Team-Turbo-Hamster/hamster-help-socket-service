const { uploadImages } = require("../api/cloudinary");
const Ticket = require("../models/ticket.model");
const User = require("../models/user.model");

const create = async ({
  body,
  title,
  images = [],
  user,
  tags = [],
  zoomLink,
  isPrivate,
}) => {
  let uploadedImages = [];

  if (images.length > 0) {
    const data = await uploadImages(images);
    uploadedImages = data;
  }

  const ticket = await Ticket.create({
    body,
    title,
    images: uploadedImages,
    user,
    tags,
    zoomLink,
    isPrivate,
  });

  await User.findByIdAndUpdate(
    user,
    {
      $push: { tickets: ticket.id },
    },
    { new: true }
  );

  return ticket.id;
};

module.exports = { create };
