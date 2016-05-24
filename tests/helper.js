'use strict';

const mongoose = require('mongoose');
const pkg = require('../package.json');

module.exports = {
  connectToDb: () => {
    if (mongoose.connection.readyState !== 1) {
      return mongoose.connect(`mongodb://localhost/${pkg.name}-test`);
    }

    return Promise.resolve();
  },
  disconnectFromDb: () => {
    const colls = mongoose.connection.collections;
    const removes = [];

    Object.keys(colls).forEach(collectionName => removes.push(colls[collectionName].remove()));

    return Promise.all(removes);
  },
  times(number, func) {
    let i = 0;
    const promises = [];

    while(i++ <= number){
      promises.push(func());
    }

    return Promise.all(promises);
  },
  promiseSeries(promises) {
    return promises.reduce(
      (previous, promise) => previous.then(() => promise),
      Promise.resolve()
    );
  }
};
