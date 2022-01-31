const { suite, describe, it } = require("mocha");
const chai = require("chai");
const expect = chai.expect;
const { setup, teardown } = require("../setup");
const httpServer = require("http").createServer();
const io = require("socket.io-client");
const jwt = require("../../utils/jwt");
const tutor = {
  data: require("../../db/data/test-data/users-tickets")[0],
  client: null,
};
const tutorToken = jwt.sign(tutor.data, tutor.data.username);
tutor.token = tutorToken;

const student1 = {
  data: require("../../db/data/test-data/users-tickets")[1],
  client: null,
};
const student1token = jwt.sign(student1.data, student1.data.username);
student1.token = student1token;

const student2 = {
  data: require("../../db/data/test-data/users-tickets")[2],
  client: null,
};
const student2token = jwt.sign(student2.data, student2.data.username);
student2.token = student2token;

const student3 = {
  data: require("../../db/data/test-data/users-tickets")[6],
  client: null,
};
const student3token = jwt.sign(student3.data, student3.data.username);
student3.token = student3token;

let socketServer;

chai.use(require("chai-as-promised"));
chai.use(require("chaid"));
chai.use(require("chai-spies"));

suite("Socket", function () {
  this.timeout(60000);

  before(async () => {
    await setup();
    socketServer = require("../../socket")(httpServer);
    await httpServer.listen(process.env.PORT);
  });

  beforeEach(async () => {
    const ioOptions = {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": true,
    };
    const ioUrl = `http://localhost:${process.env.PORT}`;

    tutor.client = io.connect(ioUrl, ioOptions);
    student1.client = io.connect(ioUrl, ioOptions);
    student2.client = io.connect(ioUrl, ioOptions);
    student3.client = io.connect(ioUrl, ioOptions);
  });

  after(async () => {
    await teardown();
    httpServer.close();
  });

  afterEach(async () => {
    tutor.client.disconnect();
    student1.client.disconnect();
    student2.client.disconnect();
    student3.client.disconnect();
  });

  describe("authenticate", function () {
    this.timeout(30000);
    it("should return a valid Tutor token and join the Tutor room when supplied with a valid username and password for a Tutor", async () => {
      const { username, password } = tutor.data;
      const error = new Promise((resolve, reject) => {
        tutor.client.on("error", (error) => {
          reject(error);
        });
      });

      const successfulLogin = new Promise((resolve, reject) => {
        tutor.client.on("authenticated", ({ token }) => {
          console.log("Authenticated");
          jwt.verify(token);
          socketServer.to("Tutor").emit("test-tutor-room");
          resolve();
        });
      });

      const addedToRoom = new Promise((resolve, reject) => {
        tutor.client.on("test-tutor-room", () => {
          console.log("Added to Room");
          resolve();
        });
      });

      tutor.client.emit("authenticate", { username, password });

      await Promise.race([Promise.all([successfulLogin, addedToRoom]), error]);
    });
    it("should return a valid Student token and join the Student room when supplied with a valid username and password for a Student", async () => {
      const { username, password } = student1.data;
      const error = new Promise((resolve, reject) => {
        student1.client.on("error", (error) => {
          reject(error);
        });
      });

      const successfulLogin = new Promise((resolve, reject) => {
        student1.client.on("authenticated", ({ token }) => {
          console.log("Authenticated");
          jwt.verify(token);
          socketServer.to("Student").emit("test-student-room");
          resolve();
        });
      });

      const addedToRoom = new Promise((resolve, reject) => {
        student1.client.on("test-student-room", () => {
          console.log("Added to Room");
          resolve();
        });
      });

      student1.client.emit("authenticate", { username, password });

      await Promise.race([Promise.all([successfulLogin, addedToRoom]), error]);
    });
    it("should return an error when supplied with a valid username and invalid password", async () => {
      const { username } = student1.data;
      const error = new Promise((resolve, reject) => {
        student1.client.on("error", (error) => {
          resolve(error);
        });
      });

      student1.client.emit("authenticate", {
        username,
        password: "averywrongpassword",
      });

      await error;
    });
    it("should return an error when supplied with a valid username and no password", async () => {
      const { username } = student1.data;
      const error = new Promise((resolve, reject) => {
        student1.client.on("error", (error) => {
          resolve(error);
        });
      });

      student1.client.emit("authenticate", {
        username,
      });

      await error;
    });
    it("should return an error when supplied with a invalid username and valid password", async () => {
      const { password } = student1.data;
      const error = new Promise((resolve, reject) => {
        student1.client.on("error", (error) => {
          resolve(error);
        });
      });

      student1.client.emit("authenticate", {
        username: "averywrongusername",
        password,
      });

      await error;
    });
    it("should return an error when supplied with a no username and valid password", async () => {
      const { password } = student1.data;
      const error = new Promise((resolve, reject) => {
        student1.client.on("error", (error) => {
          resolve(error);
        });
      });

      student1.client.emit("authenticate", {
        password,
      });

      await error;
    });
    it("should return an error if supplied with no username or password", async () => {
      const error = new Promise((resolve, reject) => {
        student1.client.on("error", (error) => {
          resolve(error);
        });
      });

      student1.client.emit("authenticate", {});

      await error;
    });
  });
  describe("create-ticket", () => {
    it("should return a new ticket and enrol the student in the room for the ticket, and notify all users of a new public ticket", async () => {
      const error = new Promise((resolve, reject) => {
        student1.client.on("error", (error) => {
          console.log(error);
          reject(error);
        });
      });

      const ticketCreated = new Promise((resolve, reject) => {
        student1.client.on("new-ticket", async ({ ticket }) => {
          console.log("Ticket Created");
          resolve();
        });
      });

      const ticketRoomJoined = new Promise((resolve, reject) => {
        student3.client.on("ticket-room-test", () => {
          console.log("Ticket Room working");
          resolve();
        });
      });

      const tutorsNotified = new Promise((resolve, reject) => {
        tutor.client.on("new-ticket", () => {
          console.log("Tutors received new ticket");
          resolve();
        });
      });

      const studentsNotified = new Promise((resolve, reject) => {
        student2.client.on("new-ticket", () => {
          console.log("Students received new ticket");
          resolve();
        });
      });

      student3.client.on("ticket-watched", ({ ticket_id }) => {
        console.log("Student3 watching Ticket");
        socketServer.to(ticket_id).emit("ticket-room-test");
      });

      student1.client.on("new-ticket", ({ ticket }) => {
        console.log("Adding student3 to ticket room");
        student3.client.emit("watch-ticket", {
          token: student3.token,
          ticket_id: ticket.id,
        });
      });

      tutor.client.on("authenticated", () => {
        console.log("Tutor Authenticated, creating new ticket for Student 1");
        student1.client.emit("create-ticket", {
          token: student1.token,
          ticket: {
            title: "Test Ticket Title",
            body: "Test Ticket Body",
            tags: ["Test Tag 1", "Test Tag 2"],
            zoomLink: "http://fake.zoom.link/now",
            isPrivate: false,
          },
        });
      });

      student2.client.on("authenticated", () => {
        console.log("Student 2 authenticated, authenticating Tutor");
        tutor.client.emit("authenticate", {
          username: tutor.data.username,
          password: tutor.data.password,
        });
      });

      student3.client.on("authenticated", () => {
        console.log("Connected, authenticating Student 2");
        student2.client.emit("authenticate", {
          username: student2.data.username,
          password: student2.data.password,
        });
      });

      student3.client.on("connect", () => {
        console.log("Connected, authenticating Student 3");
        student3.client.emit("authenticate", {
          username: student3.data.username,
          password: student3.data.password,
        });
      });

      await Promise.race([
        Promise.all([
          ticketCreated,
          ticketRoomJoined,
          tutorsNotified,
          studentsNotified,
        ]),
        error,
      ]);
    });
  });
});
