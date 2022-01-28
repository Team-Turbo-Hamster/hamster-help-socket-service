const jwt = require("../utils/jwt");
const { validatePassword } = require("../utils/password");
const User = require("../models/user.model");

const authenticate = async (username, password) => {
  const user = await User.findOne(
    { username },
    "username email +password avatar name role"
  );

  if (user && password && (await validatePassword(password, user.password))) {
    const { username, name, avatar, role, email, id } = user;
    const token = jwt.sign(
      { id, username, name, avatar, role, email },
      username
    );

    return token;
  }

  throw new Error("Invalid Credentials");
};

const reauthenticate = async (token) => {
  try {
    if (token) {
      const decoded = jwt.decode(token);

      if (
        decoded &&
        decoded.payload.username &&
        jwt.verify(token, decoded.payload.username)
      ) {
        return true;
      }
    }

    throw new Error("Invalid Token");
  } catch (err) {
    throw new Error("Invalid Token");
  }
};

module.exports = { authenticate, reauthenticate };
