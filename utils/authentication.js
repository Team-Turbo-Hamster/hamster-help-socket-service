const jwt = require("./jwt");

const isValidToken = async (token) => {
  if (token) {
    const decoded = jwt.decode(token);
    const verified = jwt.verify(token, decoded.payload.username);

    return verified;
  } else {
    throw new Error("No Token supplied");
  }
};

module.exports = isValidToken;
