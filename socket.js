const jwt = require("./utils/jwt");
const { authenticate } = require("./controllers/user.controller");
const {
  isAuthenticated,
  isStudent,
  isTutor,
} = require("./middleware/authentication-authorisation");
const log = require("./log");
const { create } = require("./controllers/ticket.controller");

const startSocketServer = (httpServer) => {
  const io = require("socket.io")(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
    },
  });

  io.on("connection", (client) => {
    log.info("Client connected");

    client.on("authenticate", async ({ username, password }) => {
      try {
        const token = await authenticate({ username, password });
        const { role } = await jwt.decode(token);
        log.info("Client authenticated");
        client.join(role);
        client.emit("authenticated", { token });
      } catch (error) {
        log.warn(error);
        client.emit("error", error);
      }
    });

    client.on("reauthenticate", (data) =>
      isAuthenticated(data, async (data) => {
        try {
          const { token } = data;
          const { role } = await jwt.decode(token);

          log.info("Client re-authenticated");
          client.join(role);
          client.emit("reauthenticated");
        } catch (err) {
          log.error(err);
          client.emit("error", { err });
        }
      })
    );

    client.on("create-ticket", (data) =>
      isStudent(data, async (data) => {
        try {
          const { ticket: newTicket } = data;
          const ticketId = await create(newTicket);

          client.join(ticketId);
          client.emit("new-ticket", { ticketId });

          client.join(ticketId);
          client.emit("ticket-updated", { ticketId });

          if (ticket.isPrivate) {
            io.to("Tutor").emit("new-ticket", { ticketId });
          } else {
            io.to("Tutor").to("Student").emit("new-ticket", { ticketId });
          }
        } catch (err) {
          log.error(err);
          client.emit("error", { err });
        }
      })
    );

    client.on("disconnect", () => {
      log.info("Client disconnected");
    });
  });

  return io;
};

module.exports = startSocketServer;
