const { suite, describe, it } = require("mocha");
const chai = require("chai");
const expect = chai.expect;
const { setup, teardown } = require("../setup");
const Timeout = require("await-timeout");
const httpServer = require("http").createServer();
const io = require("socket.io-client");
const jwt = require("../../utils/jwt");
const tutor = {
  data: require("../../db/data/test-data/users-tickets")[0],
  client: null,
  token: jwt.sign(this.data, this.data.username),
};
const student1 = {
  data: require("../../db/data/test-data/users-tickets")[1],
  client: null,
  token: jwt.sign(this.data, this.data.username),
};
const student2 = {
  data: require("../../db/data/test-data/users-tickets")[2],
  client: null,
  token: jwt.sign(this.data, this.data.username),
};
const User = require("../../models/user.model");
const { resolve } = require("path");
let socketServer;

chai.use(require("chai-as-promised"));
chai.use(require("chaid"));
chai.use(require("chai-spies"));

suite("Socket", function () {
  this.timeout(60000);

  before(async function () {
    await setup();
    socketServer = require("../../socket")(httpServer);
    await httpServer.listen(process.env.PORT);
  });

  beforeEach(async function () {
    const ioOptions = {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": true,
    };
    const ioUrl = `http://localhost:${process.env.PORT}`;

    tutor.client = io.connect(ioUrl, ioOptions);
    student1.client = io.connect(ioUrl, ioOptions);
    student2.client = io.connect(ioUrl, ioOptions);
  });

  after(async function () {
    await teardown();
    httpServer.close();
  });

  afterEach(async function () {
    tutor.client.disconnect();
    student1.client.disconnect();
    student2.client.disconnect();
  });

  describe("authenticate", () => {
    it.only("should return a valid Tutor token and join the Tutor room when supplied with a valid username and password for a Tutor", async () => {
      tutor.client.on("connect", () => {});
    });
    it("should return a valid Student token and join the Student room when supplied with a valid username and password for a Student", (done) => {
      const studentClient = io.connect(`http://localhost:${process.env.PORT}`);
      const errorSpy = chai.spy(() => done());
      const { username, password } = sampleStudent;

      studentClient.on("connect", (data) => {
        studentClient.emit("authenticate", { username, password });
      });

      studentClient.on("error", errorSpy);
      studentClient.on("authenticated", ({ token }) => {
        expect(errorSpy).not.to.have.been.called();
        expect(token).to.be.ok;
        studentClient.disconnect();
        done();
      });
    });
    it("should return an error when supplied with a valid username and invalid password", (done) => {
      const tutorClient = io.connect(`http://localhost:${process.env.PORT}`);
      const authenticated = chai.spy(() => done());
      const { username, password } = sampleTutor;

      tutorClient.on("connect", (data) => {
        tutorClient.emit("authenticate", {
          username,
          password: "verybadpassword",
        });
      });

      tutorClient.on("authenticated", authenticated);
      tutorClient.on("error", (data) => {
        expect(authenticated).not.to.have.been.called();
        done();
      });
    });
    it("should return an error when supplied with a valid username and no password", (done) => {
      const tutorClient = io.connect(`http://localhost:${process.env.PORT}`);
      const authenticated = chai.spy(() => done());
      const { username, password } = sampleTutor;

      tutorClient.on("connect", (data) => {
        tutorClient.emit("authenticate", {
          username,
        });
      });

      tutorClient.on("authenticated", authenticated);
      tutorClient.on("error", (data) => {
        expect(authenticated).not.to.have.been.called();
        done();
      });
    });
    it("should return an error when supplied with a invalid username and valid password", (done) => {
      const tutorClient = io.connect(`http://localhost:${process.env.PORT}`);
      const authenticated = chai.spy(() => done());
      const { username, password } = sampleTutor;

      tutorClient.on("connect", (data) => {
        tutorClient.emit("authenticate", {
          username: "invalidusername",
          password,
        });
      });

      tutorClient.on("authenticated", authenticated);
      tutorClient.on("error", (data) => {
        expect(authenticated).not.to.have.been.called();
        done();
      });
    });
    it("should return an error when supplied with a no username and valid password", (done) => {
      const tutorClient = io.connect(`http://localhost:${process.env.PORT}`);
      const authenticated = chai.spy(() => done());
      const { username, password } = sampleTutor;

      tutorClient.on("connect", (data) => {
        tutorClient.emit("authenticate", {
          password,
        });
      });

      tutorClient.on("authenticated", authenticated);
      tutorClient.on("error", (data) => {
        expect(authenticated).not.to.have.been.called();
        done();
      });
    });
    it("should return an error if supplied with no username or password", (done) => {
      const tutorClient = io.connect(`http://localhost:${process.env.PORT}`);
      const authenticated = chai.spy(() => done());
      const { username, password } = sampleTutor;

      tutorClient.on("connect", (data) => {
        tutorClient.emit("authenticate", {
          username,
        });
      });

      tutorClient.on("authenticated", authenticated);
      tutorClient.on("error", (data) => {
        expect(authenticated).not.to.have.been.called();
        done();
      });
    });
  });
});
