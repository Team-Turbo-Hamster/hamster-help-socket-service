const runSeed = require("../db/seeds/seed");
const mongoose = require("mongoose");

const setup = async () => {
  await mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("MongoDB Connected");
  await runSeed();
  console.log("Seed Data Completed");
};

const teardown = async () => {
  mongoose.disconnect();
};

module.exports = { setup, teardown };
