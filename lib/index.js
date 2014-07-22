var path = require('path');
var rclient = require(path.resolve(__dirname + '/connection'));
var client = rclient.get();
var utils = require(path.resolve(__dirname + '/utils'));

function SpaceSaver(k) {
  this.k = k;
  this.queue = [];  // FIFO
};

/**
Adds additional items to the queue
for processing. 
@param {String} leaderboard
@param {Array} members
@return this
*/
SpaceSaver.prototype.add = function(leaderboard, members) {
  this.queue = this.queue.concat({leaderboard: leaderboard, members: members});
  return this;
}

/**
Score, add, increment and remove
leaderboard members

@param {String} leaderboard
@param {String} member
@param {Integer} k
@param {Function} cb
@private
@return void
*/
var process = function(leaderboard, member, k, cb) {
  var c = client;
  c.zscore([leaderboard, member], function(e, score) {
    if (e) return cb(e);

    c.zcard(leaderboard, function(e, zcard) {
      if (e) return cb(e);

      // check if we have a score or 
      // if the cardinality if less than k
      if (score || zcard < k) {
        c.zincrby([leaderboard, 1, member], function(e, res) {
          if (e) return cb(e);
          cb(null, res);
        });
      } else {
        // get get the set sorted from lowest->highest score
        c.zrange([leaderboard, 0, 0, 'withscores'], function(e, items) {
          if (e) {
            return cb(e);
          }

          var key = items[0];
          var score = items[1];

          c.zrem([leaderboard, key], function(e, rem) {
            if (e) return cb(e);
            if (rem) {
              c.zadd([leaderboard, ++score, member], function(e, res) {
                if (e) return cb(e);
                cb(null, res);
              });
            } else {
              cb(null, score);
            }
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
  var entry, members, vlen, k, i;
  for (i=0; i<len; i++) {
    entry = this.queue.shift();
    members = entry.members;
    vlen = members.length;
    for (k=0; k<vlen; k++) {
      process(entry.leaderboard, members[k], _k, function(e, res) {
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
    if (e) return cb(e);
    res = utils.arrayToObject(res);
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
