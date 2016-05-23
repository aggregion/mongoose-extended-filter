'use strict';

var mongoose = require('mongoose');
var plugin = require('../../index');
var Schema = mongoose.Schema;

var docSchema = new Schema({
  name: String,
  path: {
    subpath: {
      name: String
    }
  }
});
docSchema.plugin(plugin);
docSchema.index({name: 'text'});

module.exports = mongoose.model('Doc', docSchema);
