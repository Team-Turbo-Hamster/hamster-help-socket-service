const runSeed = require("../db/seeds/seed");
const mongoose = require("mongoose");

const setup = async () => {
  await mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await runSeed();
};

const teardown = async () => {
  mongoose.disconnect();
};

module.exports = { setup, teardown };
