var async = require('async');
var mongoDotNotationTool = require('mongo-dot-notation-tool');
var encodeDotNotation = mongoDotNotationTool.encode;
var decodeDotNotation = mongoDotNotationTool.decode;

module.exports = function extendedFilter(mongoose) {
  return function(schema) {
    schema.methods.prepareConditions = prepareConditions(mongoose, schema);
    schema.statics.prepareConditions = prepareConditions(mongoose, schema);
  };
};

/**
 * Prepare condition for final query
 * @param {Object} mongoose Iinstance of Mongoose
 * @param {Object} schema Current schema of model
 * @return {function}
 */
function prepareConditions(mongoose, schema) {
  return function(conditions, callback) {
    var parsedCondition = decodeDotNotation(conditions);

    _process(mongoose, schema.tree, parsedCondition, function(err, resultConditions) {
      if (err) {
        return callback(err);
      }

      callback(null, encodeDotNotation(resultConditions));
    });
  };
}

/**
 * Main function (query maker)
 * @param {Object} mongoose Instance of Mongoose
 * @param {Object} tree Model tree from Schema.tree
 * @param {Object|Array} conditions Input conditions
 * @param {Function} cb Callback
 * @return {*}
 */
function _process(mongoose, tree, conditions, cb) {
  async.eachSeries(Object.keys(conditions), function(path, next) {
    if (['$and', '$or'].indexOf(path) >= 0) {
      return async.eachSeries(conditions[path], (_conditions, next) => {
        _process(mongoose, tree, _conditions, next);
      }, next);
    }

    if (['$in', '$nin'].indexOf(path) >= 0) {
      return next(null);
    }

    if (['$eq', '$gt', '$gte', '$lt', '$lte', '$ne'].indexOf(path) >= 0) {
      return next(null);
    }

    var refModelName = null;

    if (tree[path] && tree[path].ref) {
      refModelName = tree[path].ref;

      if (!isArray(conditions[path]) && isObject(conditions[path])) {
        var refModel = mongoose.models[refModelName];

        return prepareConditions(mongoose, refModel.schema)(conditions[path], (err, preparedConditions) => {
          if (err) {
            return next(err);
          }

          refModel.distinct('_id', preparedConditions, function(err, ids) {
            if (err) {
              return next(err);
            }

            conditions[path] = {$in: ids};

            next(null);
          });
        });
      }
    }

    next(null);
  }, err => {
    cb(err, conditions);
  });
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
