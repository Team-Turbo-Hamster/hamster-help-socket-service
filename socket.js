const jwt = require("./utils/jwt");
const { authenticate } = require("./controllers/user.controller");
const {
  isAuthenticated,
  isStudent,
  isTutor,
} = require("./middleware/authentication-authorisation");
const log = require("./log");
const {
  create,
  addComment,
  update,
} = require("./controllers/ticket.controller");
const clients = [];
const startSocketServer = (httpServer) => {
  const io = require("socket.io")(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
    },
  });

  io.on("connection", (client) => {
    log.info(`Client connected - Active Clients: ${io.engine.clientsCount}`);

    if (process.env.NODE_ENV === "development") {
      client.use((packet, next) => {
        const logger = log.getLogger(packet[0]);

        logger.info("Received message");
        logger.info(packet[1]);
        next();
      });
    }

    client.on("authenticate", async ({ username, password }) => {
      const logger = log.getLogger("authenticate");
      try {
        const token = await authenticate({ username, password });
        const { role } = await jwt.decode(token).payload;
        log.info("Client authenticated");
        await client.join(role);
        client.emit("authenticated", { token });
      } catch (error) {
        log.warn(error);
        client.emit("error", { error: error.message });
      }
    });

    client.on("reauthenticate", (data) => {
      try {
        isAuthenticated(data, async (data) => {
          try {
            const { token } = data;
            const { role } = await jwt.decode(token);

            log.info("Client re-authenticated");
            await client.join(role);
            client.emit("reauthenticated");
          } catch (error) {
            client.emit("error", error);
          }
        });
      } catch (err) {
        log.error(err);
        client.emit("error", { err });
      }
    });

    client.on("create-ticket", (data) => {
      log.info("Verifying student...");
      try {
        isStudent(data, (data) => {
          log.info("Attempting ticket creation...");

          const { ticket: newTicket, verifiedToken } = data;
          const { username } = verifiedToken;
          create({ ...newTicket, username })
            .then((ticket) => {
              client.join(ticket.id);

              log.info("Ticket Created, sending...");
              client.emit("new-ticket", { ticket });
              io.emit("new-ticket", { ticket });
            })
            .catch((error) => {
              log.error(error);
              client.emit("error", { error });
            });

          // if (ticket.isPrivate) {
          //   log.info("Ticket is private");
          //   io.to(client.id).to("Tutor").emit("new-ticket", { ticket });
          // } else {
          //   io.to("Tutor").to("Student").emit("new-ticket", { ticket });
          // }
        });
      } catch (error) {
        log.error(error);
        client.emit("error", { error });
      }
    });

    client.on("update-ticket", (data) => {
      try {
        log.info("Attempting ticket update...");
        isAuthenticated(
          data,
          isOwnerOrTutor(data, async (data) => {
            const { ticket } = data;
            const updatedTicket = await update(ticket);

            client.emit("update-ticket", { ticket: updatedTicket });

            if (updatedTicket.isPrivate) {
              io.to("Tutor").emit("update-ticket", { ticket: updatedTicket });
            } else {
              io.to("Tutor").to("Student").emit("update-ticket", { ticket_id });
            }
          })
        );
      } catch (err) {
        log.error(err);
        client.emit("error", { err });
      }
    });

    client.on("watch-ticket", (data) => {
      log.info("Watching ticket...");
      isAuthenticated(data, async ({ ticket_id }) => {
        log.info("Watching ticket");
        await client.join(ticket_id);
        client.emit("ticket-watched", { ticket_id });
      });
    });

    client.on("unwatch-ticket", (data) => {
      log.info("Unwatching ticket...");
      isAuthenticated(data, async ({ ticket_id }) => {
        client.leave(ticket_id);
      });
    });

    client.on("new-comment", (data) => {
      log.info("Adding comment...");
      isAuthenticated(data, async ({ token, ticket_id, comment }) => {
        const decoded = jwt.decode(token);
        const user_id = decoded.id;

        await addComment({ ticket_id, user_id, comment });

        io.to(ticket_id).emit("new-comment", { ticket_id, user_id, comment });
      });
    });

    client.on("disconnect", () => {
      log.info(
        `Client disconnected - Active Clients: ${io.engine.clientsCount}`
      );
    });
  });

  return io;
};

module.exports = startSocketServer;
