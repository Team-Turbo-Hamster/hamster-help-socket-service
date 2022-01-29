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

suite("Authentication", function () {
  this.timeout(60000);

  before(async function () {
    await setup();
  });

  after(async function () {
    await teardown();
  });

  describe("isValidToken", () => {
    it("should return a valid decoded token for a valid token", async () => {
      const dbUser = await User.findOne({ username: sampleUser.username });
      const token = await authenticate(
        sampleUser.username,
        sampleUser.password
      );
      const { id, username, name, avatar, role, email, aud, iss, sub } =
        await isValidToken(token);

      expect(id).to.equal(dbUser.id.toString());
      expect(username).to.equal(dbUser.username);
      expect(name).to.equal(dbUser.name);
      expect(avatar).to.equal(dbUser.avatar);
      expect(role).to.equal(dbUser.role);
      expect(email).to.equal(dbUser.email);
      expect(aud).to.equal(process.env.JWT_AUDIENCE);
      expect(iss).to.equal(process.env.JWT_ISSUER);
      expect(sub).to.equal(dbUser.username);
    });
    it("should return an error if no token is supplied", async () => {
      await expect(isValidToken()).to.be.rejectedWith("No Token supplied");
    });
    it("should return an error if an expired token is supplied", async () => {
      const expiredToken = jwtLib.sign(
        { username: "dummyusername" },
        process.env.PRIVATE_KEY,
        {
          issuer: process.env.JWT_ISSUER,
          audience: process.env.JWT_AUDIENCE,
          expiresIn: "1s",
          algorithm: "RS256",
        },
        "dummyusername"
      );

      await expect(isValidToken(expiredToken)).to.be.rejectedWith("");
    });
  });
});
