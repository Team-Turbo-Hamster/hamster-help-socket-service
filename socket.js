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
const startSocketServer = (httpServer) => {
  const io = require("socket.io")(httpServer, {
    cors: {
      origins: ["*"],
    },

    handlePreflightRequests: (req, res) => {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST",
        "Access-Control-Allow-Credentials": true,
      });
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
        const { role } = jwt.decode(token).payload;
        log.info("Client authenticated");
        await client.join(role);
        client.emit("authenticated", { token });
      } catch (error) {
        log.warn(error);
        client.emit("error", { error: error.message });
      }
    });

    client.on("reauthenticate", (data) => {
      const logger = log.getLogger("reauthenticate");
      try {
        isAuthenticated(data, (data) => {
          logger.info("User authenticated");
          try {
            const { token } = data;
            const { role } = jwt.decode(token).payload;

            log.info(`Client with role ${role} re-authenticated`);
            client.join(role);
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

              if (ticket.isPrivate) {
                log.info("Ticket is private");
                io.of("/")
                  .to(client.id)
                  .to("Tutor")
                  .emit("new-ticket", { ticket });
              } else {
                io.of("/")
                  .to(client.id)
                  .to("Tutor")
                  .to("Student")
                  .emit("new-ticket", { ticket });
              }
            })
            .catch((error) => {
              log.error(error);
              client.emit("error", { error });
            });
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
        client.join(ticket_id);
        io.of("/").to(ticket_id).emit("ticket-watched", { ticket_id });
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
      isAuthenticated(data, async ({ verifiedToken, ticket_id, comment }) => {
        const user_id = verifiedToken._id;

        const { updatedTicket, user } = await addComment({
          ticket_id,
          user_id,
          comment,
        });

        io.of("/").to(ticket_id).emit("new-comment", { updatedTicket, user });
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
