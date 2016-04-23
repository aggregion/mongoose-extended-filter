/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

var helper = require('./helper');
var async = require('async');
var faker = require('faker');
var chai = require('chai');
var expect = chai.expect;
var Doc = require('./models/doc.model');

describe('1 level', function() {
  var docs = [];

  before(done => async.waterfall([
    next => helper.connectToDb(next),
    next => async.timesSeries(10, (n, next) => {
      new Doc({
        name: faker.name.firstName(),
        path: {
          subpath: {
            name: faker.name.firstName()
          }
        }
      })
      .save()
      .then(doc => {
        docs.push(doc);
        next(null);
      }, err => next(err));
    }, next)
  ], done));

  after(done => async.waterfall([
    next => Doc.remove({}, next),
    (n, next) => helper.disconnectFromDb(next)
  ], done));

  it('simple filter by Doc.name', done => {
    var testDoc = docs[1];

    Doc.prepareConditions({name: testDoc.name}, (err, conditions) => {
      expect(err).is.null;

      Doc.find(conditions, (err, doc) => {
        expect(err).is.null;
        expect(doc).to.be.an('array');
        expect(doc).to.have.length(docs.filter(item => item.name === testDoc.name).length);

        done(null);
      });
    });
  });

  it('simple filter by Doc.path.subpath.name', done => {
    var testDoc = docs[1];

    Doc.prepareConditions({'path.subpath.name': testDoc.path.subpath.name}, (err, conditions) => {
      expect(err).is.null;

      Doc.find(conditions, (err, doc) => {
        expect(err).is.null;
        expect(doc).to.be.an('array');
        expect(doc).to.have.length(docs.filter(item => item.path.subpath.name === testDoc.path.subpath.name).length);

        done(null);
      });
    });
  });
});
