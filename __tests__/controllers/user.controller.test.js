const { suite, describe, it } = require("mocha");
const chai = require("chai");
const expect = chai.expect;
const jwtLib = require("jsonwebtoken");
const Timeout = require("await-timeout");

const {
  authenticate,
  reauthenticate,
} = require("../../controllers/user.controller");
const jwt = require("../../utils/jwt");
const { setup, teardown } = require("../setup");
const sampleUser = require("../../db/data/test-data/users-tickets")[0];

chai.use(require("chai-as-promised"));

suite("User Controller", function () {
  this.timeout(60000);

  before(async function () {
    await setup();
  });

  after(async function () {
    await teardown();
  });

  describe("authenticate", () => {
    it("should return a valid JWT for a valid username and password", async () => {
      const { username, password } = sampleUser;
      const token = await authenticate(username, password);

      expect(jwt.verify(token, username)).to.be.ok;
    });
    it("should return an error if password is incorrect", async () => {
      const { username } = sampleUser;
      await expect(authenticate(username, "wrongpassword")).to.be.rejectedWith(
        "Invalid Credentials"
      );
    });
    it("should return an error if username is incorrect", async () => {
      const { password } = sampleUser;
      await expect(authenticate("wrongusername", password)).to.be.rejectedWith(
        "Invalid Credentials"
      );
    });
    it("should return an error if username is not supplied", async () => {
      const { password } = sampleUser;
      await expect(authenticate(null, password)).to.be.rejectedWith(
        "Invalid Credentials"
      );
    });
    it("should return an error if password is not supplied", async () => {
      const { username } = sampleUser;
      await expect(authenticate(username, null)).to.be.rejectedWith(
        "Invalid Credentials"
      );
    });
    it("should return an error if username and password is not supplied", async () => {
      await expect(authenticate(null, null)).to.be.rejectedWith(
        "Invalid Credentials"
      );
    });
  });
  describe("reauthenticate", () => {
    it("should return true for a valid token", async () => {
      const { username, password } = sampleUser;
      const token = await authenticate(username, password);

      expect(await reauthenticate(token)).to.equal(true);
    });
    it("should return an error if no token is supplied", async () => {
      await expect(reauthenticate(null)).to.be.rejectedWith("Invalid Token");
    });
    it("should return an error if an expired token is supplied", async () => {
      const { username } = sampleUser;

      const expiredToken = jwtLib.sign(
        { username: username },
        process.env.PRIVATE_KEY,
        {
          issuer: process.env.JWT_ISSUER,
          audience: process.env.JWT_AUDIENCE,
          expiresIn: "1s",
          algorithm: "RS256",
        },
        username
      );

      await Timeout.set(1000);

      await expect(reauthenticate(expiredToken)).to.be.rejectedWith(
        "Invalid Token"
      );
    });
  });
});
