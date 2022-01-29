const { suite, describe, it } = require("mocha");
const chai = require("chai");
const expect = chai.expect;

const { create, update } = require("../../controllers/ticket.controller");
const { setup, teardown } = require("../setup");
const sampleUser = require("../../db/data/test-data/users-tickets")[0];
const Ticket = require("../../models/ticket.model");
const User = require("../../models/user.model");
const mongoose = require("mongoose");

chai.use(require("chai-as-promised"));
chai.use(require("chaid"));

suite("Ticket Controller", function () {
  this.timeout(60000);

  before(async function () {
    await setup();
  });

  after(async function () {
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
    it("should return an error if ticket has no body", async () => {
      const dbUser = await User.findOne({ username: sampleUser.username });
      await expect(
        create({
          title: "Test Ticket Title",
          images: [],
          user: dbUser.id,
          tags: ["Test Tag 1", "Test Tag 2"],
          zoomLink: "http://fake.zoom.link/now",
        })
      ).to.be.rejectedWith(
        "Ticket validation failed: body: Please provide a description"
      );
    });
    it("should return an error if ticket has no title", async () => {
      const dbUser = await User.findOne({ username: sampleUser.username });
      await expect(
        create({
          body: "Test Ticket Body",
          images: [],
          user: dbUser.id,
          tags: ["Test Tag 1", "Test Tag 2"],
          zoomLink: "http://fake.zoom.link/now",
        })
      ).to.be.rejectedWith(
        "Ticket validation failed: title: Please provide a title"
      );
    });
    it("should return an error if ticket has no user", async () => {
      await expect(
        create({
          title: "Test Ticket Title",
          body: "Test Ticket Body",
          images: [],
          tags: ["Test Tag 1", "Test Tag 2"],
          zoomLink: "http://fake.zoom.link/now",
        })
      ).to.be.rejectedWith(
        "Ticket validation failed: user: Ticket must belong to a user"
      );
    });
  });
  describe("update", () => {
    it("should update a ticket when given valid data", async () => {
      const dbUser = await User.findOne({ username: sampleUser.username });
      const ticketId = await create({
        body: "Test Ticket Body",
        title: "Test Ticket Title",
        user: dbUser.id,
        tags: ["Test Tag 1", "Test Tag 2"],
        zoomLink: "http://fake.zoom.link/now",
      });
      const ticket = await Ticket.findOne({
        id: mongoose.Types.ObjectId(ticketId),
      });

      ticket.body = "Edited Test Ticket Body";

      const updatedTicket = await update(ticket);

      expect(updatedTicket.body).to.equal("Edited Test Ticket Body");
    });
    it("should throw an error when given invalid data", async () => {
      const dbUser = await User.findOne({ username: sampleUser.username });
      const ticketId = await create({
        body: "Test Ticket Body",
        title: "Test Ticket Title",
        user: dbUser.id,
        tags: ["Test Tag 1", "Test Tag 2"],
        zoomLink: "http://fake.zoom.link/now",
      });
      const ticket = await Ticket.findOne({
        id: mongoose.Types.ObjectId(ticketId),
      });

      ticket.body = null;

      await expect(update(ticket)).to.be.rejectedWith(
        "Validation failed: body: Please provide a description"
      );
    });
  });
});
