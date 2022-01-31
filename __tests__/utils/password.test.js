const { suite, describe, it } = require("mocha");
const chai = require("chai");
const expect = chai.expect;
const { encryptPassword, validatePassword } = require("../../utils/password");

chai.use(require("chai-as-promised"));

suite("Password Utility", () => {
  describe("encryptPassword", () => {
    it("should return an encrypted password", async () => {
      const input = "password";
      const output = await encryptPassword(input);

      expect(output).to.be.a("string");
    });
  });

  describe("validatePassword", () => {
    it("should return a Boolean value", async () => {
      const input = "password";
      const output = await validatePassword(
        input,
        "$2b$10$0aIWuZbwpj304PGSzd1WXee5rYy7VL/yXHDNCKIvtTzkAWHxfVoOa"
      );

      expect(output).to.be.a("boolean");
    });
    it("should return true for a valid password and encrypted password", async () => {
      const input = "password";
      const output = await validatePassword(
        input,
        "$2b$10$0aIWuZbwpj304PGSzd1WXee5rYy7VL/yXHDNCKIvtTzkAWHxfVoOa"
      );
      const expected = true;

      expect(output).to.equal(expected);
    });
    it("should return false for an invalid password and encrypted password", async () => {
      const input = "password";
      const output = await validatePassword(
        input,
        "fewlkjwfeljkfwejlkwfelkjfweljkfwelkjfwe"
      );
      const expected = false;

      expect(output).to.equal(expected);
    });
  });
});
