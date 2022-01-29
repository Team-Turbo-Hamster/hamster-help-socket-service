const { suite, describe, it } = require("mocha");
const chai = require("chai");
const expect = chai.expect;
const { setup, teardown } = require("../setup");
const sampleUser = require("../../db/data/test-data/users-tickets")[0];
const { authenticate } = require("../../controllers/user.controller");
const isValidToken = require("../../utils/authentication");
const User = require("../../models/user.model");
const jwtLib = require("jsonwebtoken");

chai.use(require("chai-as-promised"));
chai.use(require("chaid"));

suite("Authorization", function () {
  this.timeout(60000);

  before(async function () {
    await setup();
  });

  after(async function () {
    await teardown();
  });
});
