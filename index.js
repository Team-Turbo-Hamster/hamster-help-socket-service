const PORT = 5000;
const server = require("http").createServer();
const mongoose = require("mongoose");
const log = require("./log");

require("./socket")(server);

mongoose
  .connect(process.env.DATABASE, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    log.info("MongoDB Database Connected");
  });

server.listen(PORT, () => {
  log.info(`HTTP Server listening on port ${PORT}`);
});
