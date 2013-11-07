var AWS = require("aws-sdk");
var _ = require("lodash");
var h = require("hubiquitus-core");

/**
 * @type {number}
 */
var fetchInterval = 60000;

/**
 * Fetch from amazon hubiquitus containers address and update hubiquitus discoveryAddrs
 * @param accessKeyId
 * @param secretAccessKey
 * @param region
 * @param tagName
 */
function startAmazonDiscovery(accessKeyId, secretAccessKey, region, tagName) {
  var auth = { "accessKeyId": accessKeyId, "secretAccessKey": secretAccessKey, "region": region};
  AWS.config.update(auth);
  var ec2 = new AWS.EC2();

  setInterval(function () {
    getAddrs(ec2, tagName, function (err, addrs) {
      if (err) {
        h.logger.err("An error occured in hubiquitus-amazon while trying to discover servers", err);
        return
      }

      h.set("discoveryAddrs", addrs);
    });
  }, fetchInterval);
}

/**
 * Fetch from amazon hubiquitus servers with containers and their adress
 * @param ec2
 * @param tagName
 * @param cb
 */
function getAddrs(ec2, tagName, cb) {
  var filters = [{"Name":"tag-key", "Values":[tagName]}, {"Name":"instance-state-code", "Values":["16"]}];
  ec2.describeInstances({"Filters": filters}, function (err, data) {
    if (err) {
      return cb(err);
    }

    var addrs = [];

    _.forEach(data.Reservations, function (resevation) {

      _.forEach(resevation.Instances, function (instance) {
        var ip = instance.PrivateIpAddress;

        _.forEach(instance.Tags, function (tag) {
          if(tag.Key === tagName) {
            var ports = tag.Value.split(";");

            _.forEach(ports, function (port) {
              if (port.length > 0) {
                addrs.push("udp://" + ip + ":" + port);
              }
            });
          }
        });
      });
    });

    return cb(null, addrs);
  });
}

module.exports = startAmazonDiscovery;


