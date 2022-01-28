const { suite, describe, it } = require("mocha");
const chai = require("chai");
const expect = chai.expect;

const { create } = require("../../controllers/ticket.controller");
const { setup, teardown } = require("../setup");
const sampleUser = require("../../db/data/test-data/users-tickets")[0];
const Ticket = require("../../models/ticket.model");
const User = require("../../models/user.model");
const mongoose = require("mongoose");

chai.use(require("chai-as-promised"));
chai.use(require("chaid"));

suite("Ticket Controller", () => {
  before(async () => {
    await setup();
  });

  after(async () => {
    await teardown();
  });

  afterEach(async () => {
    await Ticket.deleteMany();
  });

  describe("create", () => {
    it("should create a new Ticket when passed valid data", async () => {
      const dbUser = await User.findOne({ username: sampleUser.username });
      const ticketId = await create({
        body: "Test Ticket Body",
        title: "Test Ticket Title",
        images: [],
        user: dbUser.id,
        tags: ["Test Tag 1", "Test Tag 2"],
        zoomLink: "http://fake.zoom.link/now",
      });
      const ticket = await Ticket.findOne({
        id: mongoose.Types.ObjectId(ticketId),
      });
      const updatedUser = await User.findOne({ username: sampleUser.username });
      const { user, created_at, resolved, isPrivate } = ticket;

      expect(updatedUser.tickets).to.contain(ticketId);
      expect(user.toString()).to.equal(dbUser.id);
      expect(created_at).to.be.a("date");
      expect(resolved).to.equal(false);
      expect(isPrivate).to.equal(false);
    });
  });
});
