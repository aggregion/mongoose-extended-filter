'use strict';

var mongoose = require('mongoose');
var plugin = require('../../index');
var Schema = mongoose.Schema;

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
  }
});
subdocSchema.plugin(plugin);

module.exports = mongoose.model('Subdoc', subdocSchema);
