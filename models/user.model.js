const mongoose = require("mongoose");
const validator = require("validator");
const { encryptPassword } = require("../utils/password");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please insert your name"],
      minlength: 1,
      maxlength: 30,
    },
    username: {
      type: String,
      required: [true, "Please insert a username"],
      unique: true,
      lowercase: true,
      minlength: 4,
      maxlength: 15,
    },
    email: {
      type: String,
      required: [true, "Please insert your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please insert valid email"],
    },
    password: {
      type: String,
      required: [true, "Please insert a password"],
      select: false,
    },
    created_at: {
      type: Date,
      default: Date.now(),
    },
    avatar: {
      type: Object,
    },
    role: {
      type: String,
      enum: ["Student", "Tutor"],
      default: "Student",
    },
    tickets: [{ type: mongoose.Schema.ObjectId, ref: "Ticket" }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("validate", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  encryptPassword(user.password)
    .then((encrypted) => {
      user.password = encrypted.toString();
      next();
    })
    .catch((err) => {
      next(err);
    });
});

const User = mongoose.model("User", userSchema);

module.exports = User;
