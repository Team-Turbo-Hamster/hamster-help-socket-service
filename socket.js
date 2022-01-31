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
      origin: process.env.CLIENT_URL,
    },
  });

  io.on("connection", (client) => {
    log.info("Client connected");

    client.on("authenticate", async ({ username, password }) => {
      try {
        const token = await authenticate({ username, password });
        const { role } = await jwt.decode(token).payload;
        log.info("Client authenticated");
        await client.join(role);
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
          await client.join(role);
          client.emit("reauthenticated");
        } catch (err) {
          log.error(err);
          client.emit("error", { err });
        }
      })
    );

    client.on("create-ticket", (data) =>
      isStudent(data, async (data) => {
        log.info("Attempting ticket creation...");
        try {
          const { ticket: newTicket, token } = data;
          const { username } = jwt.decode(token).payload;
          const ticket = await create({ ...newTicket, username });

          await client.join(ticket.id);

          if (ticket.isPrivate) {
            io.to(ticket.id).to("Tutor").emit("new-ticket", { ticket });
          } else {
            io.to(ticket.id)
              .to("Tutor")
              .to("Student")
              .emit("new-ticket", { ticket });
          }
        } catch (err) {
          log.error(err);
          client.emit("error", { err });
        }
      })
    );

    client.on("update-ticket", (data) => {
      isAuthenticated(
        data,
        isOwnerOrTutor(data, async (data) => {
          try {
            const { ticket } = data;
            const updatedTicket = await update(ticket);

            client.emit("update-ticket", { ticket: updatedTicket });

            if (updatedTicket.isPrivate) {
              io.to("Tutor").emit("update-ticket", { ticket: updatedTicket });
            } else {
              io.to("Tutor").to("Student").emit("update-ticket", { ticket_id });
            }
          } catch (err) {
            log.error(err);
            client.emit("error", { err });
          }
        })
      );
    });

    client.on("watch-ticket", (data) => {
      isAuthenticated(data, async ({ ticket_id }) => {
        log.info("Watching ticket");
        await client.join(ticket_id);
        client.emit("ticket-watched", { ticket_id });
      });
    });

    client.on("unwatch-ticket", (data) => {
      isAuthenticated(data, async ({ ticket_id }) => {
        client.leave(ticket_id);
      });
    });

    client.on("new-comment", (data) => {
      isAuthenticated(data, async ({ token, ticket_id, comment }) => {
        const decoded = jwt.decode(token);
        const user_id = decoded.id;

        await addComment({ ticket_id, user_id, comment });

        io.to(ticket_id).emit("new-comment", { ticket_id, user_id, comment });
      });
    });

    client.on("disconnect", () => {
      log.info("Client disconnected");
    });
  });

  return io;
};

module.exports = startSocketServer;
