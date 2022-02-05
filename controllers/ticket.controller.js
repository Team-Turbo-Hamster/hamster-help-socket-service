const log = require("loglevel");
const Ticket = require("../models/ticket.model");
const User = require("../models/user.model");
const { uploadImages } = require("../api/cloudinary");

const create = async ({
  body,
  title,
  images,
  username,
  tags,
  zoomLink,
  isPrivate,
}) => {
  console.log(images);
  const user = await User.findOne({ username });

  log.info(`New ticket for user ${username}`);

  let uploadedImages = [];

  if (images.length > 0) {
    const data = await uploadImages(images, "tickets");
    uploadedImages = data;
  }

  console.log(uploadImages, "=================");
  if (user) {
    const ticket = await Ticket.create({
      body,
      title,
      images: uploadedImages,
      user: user.id,
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

    return ticket;
  } else {
    log.warn("Cannot find user to create Ticket");
    throw new Error(
      "Ticket validation failed: user: Ticket must belong to a user"
    );
  }
};

const update = async ({
  id,
  body,
  title,
  images,
  user,
  tags,
  zoomLink,
  isPrivate,
  isResolved,
}) => {
  const updatedTicket = await Ticket.findOneAndUpdate(
    { id },
    {
      body,
      title,
      images: images || [],
      user,
      tags,
      zoomLink,
      isPrivate,
      isResolved,
    },
    { new: true, runValidators: true }
  );

  return updatedTicket;
};

const addComment = async ({ ticket_id, user_id, comment }) => {
  console.log("before req", "===============", ticket_id, user_id);
  const updatedTicket = await Ticket.findByIdAndUpdate(
    ticket_id,
    {
      $push: { comments: { body: comment, user: user_id } },
    },
    { new: true }
  ).populate({
    path: "comments",
    populate: {
      path: "user",
      model: "User",
    },
  });
  console.log("after req", updatedTicket);
  return updatedTicket;
};

module.exports = { create, update, addComment };
