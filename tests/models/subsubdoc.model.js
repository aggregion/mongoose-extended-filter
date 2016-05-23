'use strict';

var mongoose = require('mongoose');
var plugin = require('../../index');
var Schema = mongoose.Schema;

var subsubdocSchema = new Schema({
  name: String,
  subdoc: {
    type: Schema.Types.ObjectId,
    ref: 'Subdoc'
  },
  path: {
    subpath: {
      anydoc: {
        type: Schema.Types.ObjectId,
        ref: 'Subdoc'
      },
      name: String
    }
  }
});
subsubdocSchema.plugin(plugin);

module.exports = mongoose.model('Subsubdoc', subsubdocSchema);
