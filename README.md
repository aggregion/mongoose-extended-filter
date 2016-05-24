# mongoose-extended-filter [![Build Status](https://travis-ci.org/aggregion/mongoose-extended-filter.svg?branch=master)](https://travis-ci.org/aggregion/mongoose-extended-filter)
Extended filter for Mongoose

## Use
```javascript
const mongoose = require('mongoose');
const mongooseExtendedFilter = require('mongoose-extended-filter');

const treeSchema = new mongoose.Schema({
  name: String
});

const branchSchema = new mongoose.Schema({
  name: String,
  tree: {
    type: ObjectId,
    ref: 'Tree'
  }
});

treeSchema.plugin(mongooseExtendedFilter);
branchSchema.plugin(mongooseExtendedFilter);

const Tree = mongoose.model('Tree', treeSchema);
const Branch = mongoose.model('Branch', branchSchema);

Branch.prepareConditions({tree: {name: 'Billy'}})
  .then(conditions => {
    // conditions = {tree: {$in: [...]}
    return Branch.find(conditions).exec();
  })
  .then(branches => {
    // some code
  });

// or with dot-notation
Branch.prepareConditions({'tree.name': 'Billy'})
  .then(conditions => {
    // conditions = {tree: {$in: [...]}
    return Branch.find(conditions).exec()
  })
  .then(branches => {
    // some code
  });
```