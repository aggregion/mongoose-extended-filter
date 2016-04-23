# mongoose-extended-filter [![Build Status](https://travis-ci.org/aggregion/mongoose-extended-filter.svg?branch=master)](https://travis-ci.org/aggregion/mongoose-extended-filter)
Extended filter for Mongoose

## Use
```javascript
var mongoose = require('mongoose');
var mongooseExtendedFilter = require('mongoose-extended-filter');

var treeSchema = new mongoose.Schema({
  name: String
});

var branchSchema = new mongoose.Schema({
  name: String,
  tree: {
    type: ObjectId,
    ref: 'Tree'
  }
});

treeSchema.plugin(mongooseExtendedFilter);
branchSchema.plugin(mongooseExtendedFilter);

var Tree = mongoose.model('Tree', treeSchema);
var Branch = mongoose.model('Branch', branchSchema);

Branch.prepareConditions({tree: {name: 'Billy'}}, function(err, conditions) {
  // conditions = {tree: {$in: [...]}
  Branch.find(conditions, function(err, branches) {
    // some code
  });
});

// or with dot-notation
Branch.prepareConditions({'tree.name': 'Billy'}, function(err, conditions) {
  // conditions = {tree: {$in: [...]}
  Branch.find(conditions, function(err, branches) {
    // some code
  });
});
```