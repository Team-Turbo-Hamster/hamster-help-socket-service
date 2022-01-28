const startSocketServer = (httpServer) => {
  const io = require("socket.io")(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
    },
  });
  const Joi = require("joi");

  Joi.objectid = require("joi-objectid");

  io.on("connection", (client) => {
    log.info("Client connected");

    client.on("login", async ({ username, password }) => {
      const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
      });

      try {
        await schema.validateAsync({ username, password });
      } catch (err) {
        log.error(schema.details);
      }
    });

    client.on("disconnect", () => {
      log.info("Client disconnected");
    });
  });
};

module.exports = startSocketServer;
