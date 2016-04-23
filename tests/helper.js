var mongoose = require('mongoose');
var async = require('async');
var db = mongoose.connection;
var pkg = require('../package.json');

module.exports = {
  connectToDb: cb => {
    if (mongoose.connection.readyState !== 1) {
      mongoose.connect(`mongodb://localhost/${pkg.name}-test`);
      return db.once('open', cb);
    }

    cb(null);
  },
  disconnectFromDb: cb => {
    var colls = mongoose.connection.collections;

    async.eachSeries(Object.keys(colls), (collectionName, next) => {
      colls[collectionName].remove({}, next);
    }, err => {
      cb(err);
    });
  }
};
