// const { suite, describe, it } = require("mocha");
// const chai = require("chai");
// const expect = chai.expect;
// const { setup, teardown } = require("../setup");
// const sampleTutor = require("../../db/data/test-data/users-tickets")[0];
// const sampleStudent = require("../../db/data/test-data/users-tickets")[1];
// const { authenticate } = require("../../controllers/user.controller");
// const {
//   isAuthenticated,
//   isStudent,
//   isTutor,
// } = require("../../middleware/authentication-authorisation");
// const jwtLib = require("jsonwebtoken");
// const Timeout = require("await-timeout");

// chai.use(require("chai-as-promised"));
// chai.use(require("chaid"));
// chai.use(require("chai-spies"));

// suite("Authorisation", function () {
//   this.timeout(60000);

//   before(async function () {
//     await setup();
//   });

//   after(async function () {
//     await teardown();
//   });

//   describe("isAuthenticated", () => {
//     it("should call the passed function when called with a valid token", async () => {
//       const { username, password } = sampleTutor;
//       const token = await authenticate({ username, password });
//       const spy = chai.spy((data) => {
//         return `Called with ${data}`;
//       });
//       isAuthenticated({ string: "Hello", token }, spy);

//       expect(spy).to.have.been.called();
//     });
//     it("should not call the passed function when called with an invalid token", async () => {
//       const spy = chai.spy((data) => {
//         return `Called with ${data}`;
//       });
//       const expiredToken = jwtLib.sign(
//         { username: sampleTutor.username },
//         process.env.PRIVATE_KEY,
//         {
//           issuer: process.env.JWT_ISSUER,
//           audience: process.env.JWT_AUDIENCE,
//           expiresIn: "1s",
//           algorithm: "RS256",
//         },
//         sampleTutor.username
//       );

//       await Timeout.set(2000);

//       expect(isAuthenticated({ token: expiredToken }, spy)).to.throw(
//         "jwt expired"
//       );

//       expect(spy).not.to.have.been.called();
//     });
//     it("should not call the passed function when called with no token", async () => {
//       const spy = chai.spy((data) => {
//         return `Called with ${data}`;
//       });

//       expect(isAuthenticated({ string: "Hello" }, spy)).to.be.rejectedWith(
//         "No Token supplied"
//       );

//       expect(spy).not.to.have.been.called();
//     });
//   });
//   describe("isStudent", () => {
//     it("should call the supplied function when supplied with a valid student token", async () => {
//       const { username, password } = sampleStudent;
//       const token = await authenticate({ username, password });
//       const spy = chai.spy((data) => {
//         return `Called with ${data}`;
//       });

//       await isStudent({ string: "Hello", token }, spy);

//       expect(spy).to.have.been.called();
//     });
//     it("should not call the supplied function when supplied with a non-student token", async () => {
//       const { username, password } = sampleTutor;
//       const token = await authenticate({ username, password });
//       const spy = chai.spy((data) => {
//         return `Called with ${data}`;
//       });

//       await expect(
//         isStudent({ string: "Hello", token }, spy)
//       ).to.be.rejectedWith("Not a Student");

//       expect(spy).not.to.have.been.called();
//     });
//     it("should not call the supplied function when supplied with an expired token", async () => {
//       const expiredToken = jwtLib.sign(
//         { username: sampleStudent.username, role: "Student" },
//         process.env.PRIVATE_KEY,
//         {
//           issuer: process.env.JWT_ISSUER,
//           audience: process.env.JWT_AUDIENCE,
//           expiresIn: "1s",
//           algorithm: "RS256",
//         },
//         sampleStudent.username
//       );

//       await Timeout.set(1000);
//       const spy = chai.spy((data) => {
//         return `Called with ${data}`;
//       });

//       await expect(
//         isStudent({ string: "Hello", token: expiredToken }, spy)
//       ).to.be.rejectedWith("jwt expired");

//       expect(spy).not.to.have.been.called();
//     });
//   });
//   describe("isTutor", () => {
//     it("should call the supplied function when supplied with a valid tutor token", async () => {
//       const { username, password } = sampleTutor;
//       const token = await authenticate({ username, password });
//       const spy = chai.spy((data) => {
//         return `Called with ${data}`;
//       });

//       await isTutor({ string: "Hello", token }, spy);

//       expect(spy).to.have.been.called();
//     });
//     it("should not call the supplied function when supplied with a non-tutor token", async () => {
//       const { username, password } = sampleStudent;
//       const token = await authenticate({
//         username,
//         password,
//       });
//       const spy = chai.spy((data) => {
//         return `Called with ${data}`;
//       });

//       await expect(isTutor({ string: "Hello", token }, spy)).to.be.rejectedWith(
//         "Not a Tutor"
//       );

//       expect(spy).not.to.have.been.called();
//     });
//     it("should not call the supplied function when supplied with an expired token", async () => {
//       const expiredToken = jwtLib.sign(
//         { username: sampleTutor.username, role: "Tutor" },
//         process.env.PRIVATE_KEY,
//         {
//           issuer: process.env.JWT_ISSUER,
//           audience: process.env.JWT_AUDIENCE,
//           expiresIn: "1s",
//           algorithm: "RS256",
//         },
//         sampleTutor.username
//       );

//       await Timeout.set(1000);
//       const spy = chai.spy((data) => {
//         return `Called with ${data}`;
//       });

//       await expect(
//         isTutor({ string: "Hello", token: expiredToken }, spy)
//       ).to.be.rejectedWith("jwt expired");

//       expect(spy).not.to.have.been.called();
//     });
//   });
// });
