var logger = require("hubiquitus-core").logger;

module.exports = function () {
  var count = 0;

  return function (from, content, date, cb) {
    if (++count%1000 === 0)
      logger.info("[" + this.id + "] " + content + " sent at " + date + " from " + from + " (" + count + " total)");
    this.send(from, "ping");
  };
};
