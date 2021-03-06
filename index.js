'use strict';

const mongoDotNotationTool = require('mongo-dot-notation-tool');
const encodeDotNotation = mongoDotNotationTool.encode;
const decodeDotNotation = mongoDotNotationTool.decode;
let mongoose;

module.exports = function(schema, options) {
  options = options || {};

  mongoose = options.mongoose || require('mongoose'); // lasy load

  schema.methods.prepareConditions = schema.statics.prepareConditions = prepareConditions(schema);
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
      })
      .catch(callback);
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
      if (isExtendedOperator(path)) {
        return Promise.all(
          conditions[path].map(_conditions => {
            return _process(tree, _conditions);
          })
        );
      }
      // console.log(prevPath, tree);
      if (isQueryOperator(path)) {
        return null;
      }

      if (tree[path] && tree[path].ref) {
        const refModelName = tree[path].ref;

        if (isObject(conditions[path]) && isSkipCondition(conditions[path])) {
          return null;
        }

        if (!isArray(conditions[path]) && isObject(conditions[path])) {
          const refModel = mongoose.models[refModelName];

          return prepareConditions(refModel.schema)(conditions[path])
            .then(preparedConditions =>
              refModel.distinct('_id', preparedConditions)
              .exec()
              .then(ids => {
                conditions[path] = {
                  $in: ids
                };
              })
            );
        }
      } else if (isObject(conditions[path])) {
        if (isSchema(tree[path])) {
          return _process(tree[path].tree, conditions[path]);
        }
        return _process(tree[path], conditions[path]);
      }

      return null;
    });

  return Promise.all(promises).then(() => {
    return conditions;
  });
}

/**
 * Checks value is Schema.
 *
 * @param {*} value Value
 * @returns {Boolean}
 */
function isSchema(value) {
  return value instanceof mongoose.Schema;
}

/**
 * Checks need whether to go deeper in this condition.
 *
 * @param {Object} condition Query condition
 * @returns {Boolean}
 */
function isSkipCondition(condition) {
  return Object.keys(condition).every(key => isQueryOperator(key) && !isExtendedOperator(key));
}

/**
 * Is extended operator
 *
 * @param {String} operator MongoDB Query operator
 * @returns {boolean}
 */
function isExtendedOperator(operator) {
  return operator === '$and' || operator === '$or';
}

/**
 * Is mongodb query operator
 *
 * @param {String} operator MongoDB Query operator
 * @returns {boolean}
 */
function isQueryOperator(operator) {
  return ['$in', '$nin', '$eq', '$gt', '$gte', '$lt', '$lte', '$ne', '$search', '$regex', '$options'].indexOf(operator) >= 0;
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
 * @param {*} value Value
 * @return {Boolean}
 */
function isArray(value) {
  return value && Array.isArray(value);
}
