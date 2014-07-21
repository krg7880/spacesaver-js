var path = require('path');
var client = require(path.resolve(__dirname + '/connection')).get();

function SpaceSaver(k) {
  this.k = k;
  this.queue = [];  // FIFO
};

/**
Adds additional items to the queue
for processing. 
@param {Object} o Object defining board and values
  example: {leaderboard: <leaderboard>, values: [v1, v2,...,vn]}
@return this
*/
SpaceSaver.prototype.add = function(o) {
  this.queue = this.queue.concat(o);
  return this;
}

/**
Score, add, increment and remove
leaderboard members.

@param {String} leaderboard
@param {String} value
@param {Integer} k
@param {Function} cb
@private
@return void
*/
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

/**
Increments the data stored in the queue.

@param {Function} cb Function to invoke
after processing completes.
@return void
*/
SpaceSaver.prototype.increment = function(cb) {
  var len = this.queue.length;
  var completed = 0;
  var errors = [];
  var _k = this.k;
  var entry, values, vlen, k, i;
  for (i=0; i<len; i++) {
    entry = this.queue.shift();
    values = entry.values;
    vlen = values.length;
    for (k=0; k<vlen; k++) {
      process(entry.leaderboard, values[k], _k, function(e, res) {
        if (e) errors.push(e);
        if (++completed >= len) {
          cb(((errors.length > 0) ? errors : null));
        }
      });
    }
  }
};

/**
Fetches the leader for a given category
@param {Object} leaderboard The leaderboard to fetch
@param {Integer} k The top k items to fetch. Defaults to
  max k member property set in constructor.
@param {Function} cb Function to invoke after processing
  completes.
@return void
*/
SpaceSaver.prototype.leaders = function(leaderboard, k, cb) {
  k = k || this.k;
  client.zrevrange([leaderboard, 0, k-1, 'withscores'], function(e, res) {
    cb(e, res);
  });
};

/**
Resets the specified leaderboard
@param {String} learderboard The collection to reset
@param {Function} cb Function to invoke after resetting
  leaderboard.
@return void
*/
SpaceSaver.prototype.reset = function(leaderboard, cb) {
  client.del(leaderboard, function(e, del) {
    cb(e, del);
  });
};

module.exports = SpaceSaver;
