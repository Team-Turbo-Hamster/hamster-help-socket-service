const log = require("loglevel");
const Ticket = require("../models/ticket.model");
const User = require("../models/user.model");

const create = async ({
  body,
  title,
  images,
  username,
  tags,
  zoomLink,
  isPrivate,
}) => {
  const user = await User.findOne({ username });

  log.info(`New ticket for user ${username}`);
  if (user) {
    const ticket = await Ticket.create({
      body,
      title,
      images,
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

const addComment = async ({ ticket_id, username, comment }) => {
  const ticket = await Ticket.findOne({ id: ticket_id });
  const user = await User.findOne({ username });

  if (ticket && user) {
    ticket.comments.push({ ticket_id, user: user.id, comment });

    await ticket.save();
  } else {
    throw new Error("Invalid Ticket Comment Details");
  }
};

module.exports = { create, update, addComment };
