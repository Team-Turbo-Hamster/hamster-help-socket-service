const mongoose = require("mongoose");
const validator = require("validator");

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    require: [true, "Please provide a title"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Ticket must belong to a user"],
  },
  body: {
    type: String,
    required: [true, "Please provide a description"],
  },
  tags: {
    type: [String],
  },
  zoomLink: {
    type: String,
    validate: [validator.isURL, "Please provide a valid link"],
  },
  images: [
    {
      type: Object,
    },
  ],
  comments: [
    {
      type: new mongoose.Schema({
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          require: [true, "Please provide a user ID"],
        },
        comment: {
          type: String,
          require: [true, "Please provide a comment"],
        },
        created_at: {
          type: Date,
          default: Date.now(),
        },
      }),
    },
  ],
  created_at: {
    type: Date,
    default: Date.now(),
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
