var path = require('path');
var client = require(path.resolve(__dirname + '/connection')).get();

function SpaceSaver(k) {
  this.k = k;
  this.stack = [];
};

/**
@param {Object} o {leaderboard: <leaderboard>, values: [, v2, ...,Vn]}
@param {Function} cb Callback function
*/
SpaceSaver.prototype.increment = function(o) {
  if (typeof o !== 'object') throw new TypeError('Invaid Argument!');
  var self = this;
  this.stack = this.stack.concat(o);
  return this;
};

var process = function(leaderboard, value, k, cb) {
  var c = client;
  c.zscore([leaderboard, value], function(e, score) {
    if (e) return cb(e);
    c.zcard(leaderboard, function(e, zcard) {
      if (e) return cb(e);
      if (score || (zcard < k)) {
        c.zincrby([leaderboard, 1, value], function(e, res) {
          if (e) return cb(e);
          cb(null, res);
        });
      } else {
        c.zrange([leaderboard, 0, 0, 'withscores'], function(e, scores) {
          if (e) return cb(e);
          var score = scores[0];
          var newScore = parseInt(score, 10) + 1;
          c.zrem([leaderboard, score], function(e, rem) {
            if (e) return cb(e);
            c.zadd([leaderboard, newScore, value], function(e, res) {
              if (e) return cb(e);
              cb(null, newScore);
            });
          });
        });
      }
    });
  });
};

SpaceSaver.prototype.process = function(cb) {
  var len = this.stack.length;
  var completed = 0;
  var errors = [];
  var k = this.k;
  for (var i=0; i<len; i++) {
    var entry = this.stack.shift();
    var values = entry.values;
    var vlen = values.length;
    for (var k=0; k<vlen; k++) {
      process(entry.leaderboard, values[k], this.k, function(e, res) {
        if (e) errors.push(e);
        if (++completed >= len) {
          cb(((errors.length > 0) ? errors : null));
        }
      });
    }
  }
}

SpaceSaver.prototype.leaders = function(o, cb) {
  if (typeof o !== 'object') throw new TypeError('Invalid Argument');

  o.k = o.k || this.k;
  client.zrevrange([o.leaderboard, 0, o.k-1, 'withscores'], function(e, res) {
    cb(e, res);
  });
};

SpaceSaver.prototype.reset = function(leaderboard, cb) {
  client.del(leaderboard, function(e, del) {
    cb(e, del);
  });
};

module.exports = SpaceSaver;
