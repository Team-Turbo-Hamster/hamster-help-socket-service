const log = require("loglevel");
const jwt = require("../utils/jwt");

const isAuthenticated = (data, next) => {
  const { token } = data;

  console.log(token);
  if (token) {
    const decoded = jwt.decode(token);

    console.log(decoded);
    if (decoded) {
      const verifiedToken = jwt.verify(token, decoded.payload.username);

      if (verifiedToken) {
        next({ ...data, verifiedToken });
      }
    }
  }
};

const isRole = (data, role, next) => {
  const { verifiedToken } = data;

  if (verifiedToken && verifiedToken.role === role) {
    log.info(`User is a ${role}`);
    next(data);
  } else {
    log.warn(`User is not a ${role}`);
    throw new Error(`Not a ${role}`);
  }
};

const isOwnerOrTutor = (data, next) =>
  isAuthenticated(data, (data) => {
    const { verifiedToken } = data;

    if (verifiedToken && verifiedToken.role === "Tutor") {
      next(data);
    } else {
      const ticket = Ticket.findOne({ id: ticket_id });

      if (ticket.user === decodedToken.id) {
        next(data);
      } else {
        throw new Error("Not authorised for this operation");
      }
    }
  });

const isStudent = (data, next) =>
  isAuthenticated(data, (data) => {
    isRole(data, "Student", next);
  });

const isTutor = (data, next) =>
  isAuthenticated(data, (data) => {
    isRole(data, "Tutor", next);
  });

module.exports = { isAuthenticated, isStudent, isTutor, isOwnerOrTutor };
