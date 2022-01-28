const isRole = (socket, data, next, role) => {
  const { token } = data;

  try {
    if (decoded.payload.role === role) {
      return next(data);
    } else {
      throw new Error(`User is not a ${role}`);
    }
  } catch (error) {
    return () => socket.emit(SM.SENT_TO_CLIENT.ERROR, { error });
  }
};

const isStudent = (socket, data, next) => {
  return isRole(socket, data, next, "Student");
};

const isTutor = (socket, data, next) => {
  return isRole(socket, data, next, "Tutor");
};

module.exports = { isStudent, isTutor };
