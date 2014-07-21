var redis = require('redis');
var NOOP = function() {};
var client = redis.createClient();
    client.on('error', NOOP)
    .on('connect', NOOP);
    
module.exports = {
  get: function() {
    return client;
  }
};