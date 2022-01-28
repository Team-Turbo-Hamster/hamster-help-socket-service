const NodeRSA = require("node-rsa");
const key = new NodeRSA({ b: 512 });
let keypair = {
  private: key.exportKey(),
  public: key.exportKey("public"),
};

console.log(keypair);
