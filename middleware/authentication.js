const jwt = require("../api/jwt");
const validToken = (token) => {
  const decoded = jwt.decode(token);

  return jwt.verify(token, decoded.payload.email);
};

const isAuth = (socket, data, next) => {
  const { token } = data;
  const decoded = validToken(token);

  if (decoded) {
    return next(socket, { ...data, decoded: { ...decoded } });
  } else {
    throw new Error("Invalid Token");
  }
};

module.exports = { isAuth };
