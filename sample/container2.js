var hubiquitus = require("hubiquitus-core");
var logger = require("hubiquitus-core").logger;

require(__dirname + "/../index.js")({key: "mykey", secret: "mysecret", region: "eu-west-1", tag: "mytag"});

logger.level = "info";

hubiquitus.start({discoveryPort: 4445})
  .addActor("pong", require("./player")())
  .send("pong", "ping", "ping");

