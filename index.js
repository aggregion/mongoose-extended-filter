'use strict';

const mongoDotNotationTool = require('mongo-dot-notation-tool');
const mongoose = require('mongoose');
const encodeDotNotation = mongoDotNotationTool.encode;
const decodeDotNotation = mongoDotNotationTool.decode;

module.exports = function(schema) {
  schema.methods.prepareConditions =
    schema.statics.prepareConditions = prepareConditions(schema);
};

/**
 * Wrap for prepare conditions func
 *
 * @param {Schema} schema Schema of model
 * @returns {Function}
 */
function prepareConditions(schema) {
  /**
   * Prepare condition for final query
   *
   * @param {Object} conditions Query conditions
   * @param {Function} callback End callback
   * @returns {Promise}
   */
  return function(conditions, callback) {
    const parsedCondition = decodeDotNotation(conditions);

    return _process(schema.tree, parsedCondition)
      .then(resultConditions => {
        const encoded = encodeDotNotation(resultConditions);

        if (callback) {
          return callback(null, encoded);
        }

        return encoded;
      });
  };
}

/**
 * Main function (query maker)
 *
 * @param {Object} tree Model tree from Schema.tree
 * @param {Object|Array} conditions Input conditions
 * @return {*}
 */
function _process(tree, conditions) {
  const promises = Object.keys(conditions)
    .map(path => {
      if (['$and', '$or'].indexOf(path) >= 0) {
        return Promise.all(
          conditions[path].map(_conditions => {
            return _process(tree, _conditions);
          })
        );
      }

      if (['$in', '$nin'].indexOf(path) >= 0) {
        return null;
      }

      if (['$eq', '$gt', '$gte', '$lt', '$lte', '$ne'].indexOf(path) >= 0) {
        return null;
      }

      if (tree[path] && tree[path].ref) {
        const refModelName = tree[path].ref;
        
        if (isObject(conditions[path]) &&
          Object.keys(conditions[path]).every(cond => cond.charAt(0) === '$' && cond !== '$text' && !isArray(conditions[path][cond]))) {
          return null;
        }

        if (!isArray(conditions[path]) && isObject(conditions[path])) {
          const refModel = mongoose.models[refModelName];

          return prepareConditions(refModel.schema)(conditions[path])
            .then(preparedConditions =>
              refModel.distinct('_id', preparedConditions)
                .exec()
                .then(ids => {
                  conditions[path] = {$in: ids};
                })
            );
        }
      }

      return null;
    });

  return Promise.all(promises).then(() => conditions);
}

/**
 * Check input data for Object
 * @param {*} value Input data
 * @return {Boolean}
 */
function isObject(value) {
  return value && value.toString() === '[object Object]';
}

/**
 * Check input data for Array
 * @param  {[type]}  value [description]
 * @return {Boolean}       [description]
 */
function isArray(value) {
  return value && Array.isArray(value);
}
