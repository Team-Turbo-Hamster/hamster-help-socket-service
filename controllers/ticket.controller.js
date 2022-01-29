const Ticket = require("../models/ticket.model");
const User = require("../models/user.model");

const create = async ({
  body,
  title,
  images,
  user,
  tags,
  zoomLink,
  isPrivate,
}) => {
  const ticket = await Ticket.create({
    body,
    title,
    images,
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

const addComment = async (id, user_id, comment) => {
  const ticket = await Ticket.findOne({ id });

  ticket.comments.push({ user: user_id, comment: comment });

  ticket.save();
};

module.exports = { create, update, addComment };
