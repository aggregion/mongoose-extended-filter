'use strict';

var mongoose = require('mongoose');
var plugin = require('../../index');
var Schema = mongoose.Schema;

var docPathAsSchema = new Schema({
  doc: {
    type: Schema.Types.ObjectId,
    ref: 'Doc'
  }
}, {
  _id: false
});

var subdocSchema = new Schema({
  name: String,
  doc: {
    type: Schema.Types.ObjectId,
    ref: 'Doc'
  },
  path: {
    subpath: {
      doc: {
        type: Schema.Types.ObjectId,
        ref: 'Doc'
      },
      name: String
    }
  },
  docPathAsSchema
});
subdocSchema.plugin(plugin);

module.exports = mongoose.model('Subdoc', subdocSchema);
