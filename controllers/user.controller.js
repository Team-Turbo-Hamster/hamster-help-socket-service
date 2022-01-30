const jwt = require("../utils/jwt");
const { validatePassword } = require("../utils/password");
const User = require("../models/user.model");
const log = require("../log");

const authenticate = async ({ username, password }) => {
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

    log.info("Client authenticated");
    return token;
  }

  log.warn("Client not authenticated");
  throw new Error("Invalid Credentials");
};

module.exports = { authenticate };
