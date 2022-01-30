const isValidToken = require("../utils/authentication");

const isAuthenticated = async (data, next) => {
  const { token } = data;
  const verifiedToken = await isValidToken(token);

  if (verifiedToken) {
    next(data);
  }
};

const isRole = async (data, role, next) => {
  const { token } = data;
  const decodedToken = await isValidToken(token);

  if (decodedToken.role === role) {
    next(data);
  } else {
    throw new Error(`Not a ${role}`);
  }
};

const isStudent = async (data, next) => {
  await isRole(data, "Student", next);
};

const isTutor = async (data, next) => {
  await isRole(data, "Tutor", next);
};

module.exports = { isAuthenticated, isStudent, isTutor };
