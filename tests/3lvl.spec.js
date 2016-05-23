'use strict';

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

var helper = require('./helper');
var async = require('async');
var faker = require('faker');
var chai = require('chai');
var expect = chai.expect;
var Doc = require('./models/doc.model');
var Subdoc = require('./models/subdoc.model');
var Subsubdoc = require('./models/subsubdoc.model');

describe('3 level', function() {
  var DOCS = [];
  var SUBDOCS = [];
  var SUBSUBDOCS = [];

  before(() =>
    helper
      .promiseSeries([
        helper.connectToDb(),
        helper
          .times(10, () => {
            return Doc.create({
              name: faker.name.firstName(),
              path: {
                subpath: {
                  name: faker.name.firstName()
                }
              }
            });
          })
          .then(saved => {
            DOCS = saved;

            return Promise.all(
              DOCS.map(doc => Subdoc.create({
                name: faker.name.firstName(),
                doc: doc._id
              }))
            );
          })
          .then(saved => {
            SUBDOCS = saved;

            return Promise.all(
              SUBDOCS.map(doc => Subsubdoc.create({
                name: faker.name.firstName(),
                subdoc: doc._id
              }))
            );
          })
          .then(saved => (SUBSUBDOCS = saved))
      ])
  );

  it('filter by Subsubdoc.subdoc.doc.name', done => {
    var testDoc = DOCS[1];

    Subsubdoc.prepareConditions({'subdoc.doc.name': testDoc.name}, (err, conditions) => {
      expect(err, JSON.stringify(err)).is.null;

      Subsubdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.name === testDoc.name).map(item => item.id);
        var subdocIds = SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0).map(item => item.id);

        expect(docs).to.have.length(SUBSUBDOCS.filter(item => subdocIds.indexOf(item.subdoc.toString()) >= 0).length);

        done(null);
      });
    });
  });

  it('filter by Subsubdoc.subdoc.doc.name AND Subsubdoc.subdoc.name', done => {
    var testDoc = DOCS[1];
    var testSubdoc = SUBDOCS[1];

    Subsubdoc.prepareConditions({'subdoc.doc.name': testDoc.name, 'subdoc.name': testSubdoc.name}, (err, conditions) => {
      expect(err, JSON.stringify(err)).is.null;

      Subsubdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.name === testDoc.name).map(item => item.id);
        var subdocIds = SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0 && item.name === testSubdoc.name).map(item => item.id);

        expect(docs).to.have.length(SUBSUBDOCS.filter(item => subdocIds.indexOf(item.subdoc.toString()) >= 0).length);

        done(null);
      });
    });
  });

  it('filter by Subsubdoc.subdoc.doc.name AND Subsubdoc.subdoc.name ($and)', done => {
    var testDoc = DOCS[1];
    var testSubdoc = SUBDOCS[1];

    Subsubdoc.prepareConditions({$and: [{'subdoc.doc.name': testDoc.name}, {'subdoc.name': testSubdoc.name}]}, (err, conditions) => {
      expect(err, JSON.stringify(err)).is.null;

      Subsubdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.name === testDoc.name).map(item => item.id);
        var subdocIds = SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0 && item.name === testSubdoc.name).map(item => item.id);

        expect(docs).to.have.length(SUBSUBDOCS.filter(item => subdocIds.indexOf(item.subdoc.toString()) >= 0).length);

        done(null);
      });
    });
  });

  it('filter by Subsubdoc.subdoc.doc.name OR Subsubdoc.subdoc.name ($or)', done => {
    var testDoc = DOCS[1];
    var testSubdoc = SUBDOCS[2];

    Subsubdoc.prepareConditions({$or: [{'subdoc.doc.name': testDoc.name}, {'subdoc.name': testSubdoc.name}]}, (err, conditions) => {
      expect(err, JSON.stringify(err)).is.null;

      Subsubdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.name === testDoc.name).map(item => item.id);
        var subdocIds = SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0 || item.name === testSubdoc.name).map(item => item.id);

        expect(docs).to.have.length(SUBSUBDOCS.filter(item => subdocIds.indexOf(item.subdoc.toString()) >= 0).length);

        done(null);
      });
    });
  });

  it('filter by Subsubdoc.subdoc.doc.name AND Subsubdoc.subdoc.name ($and) #2', done => {
    var testDoc = DOCS[1];
    var testSubdoc = SUBDOCS[1];

    Subsubdoc.prepareConditions({subdoc: {$and: [{'doc.name': testDoc.name}, {name: testSubdoc.name}]}}, (err, conditions) => {
      expect(err, JSON.stringify(err)).is.null;

      Subsubdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.name === testDoc.name).map(item => item.id);
        var subdocIds = SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0 && item.name === testSubdoc.name).map(item => item.id);

        expect(docs).to.have.length(SUBSUBDOCS.filter(item => subdocIds.indexOf(item.subdoc.toString()) >= 0).length);

        done(null);
      });
    });
  });

  it('filter by Subsubdoc.subdoc.doc.name OR Subsubdoc.subdoc.name ($or) #2', done => {
    var testDoc = DOCS[2];
    var testSubdoc = SUBDOCS[1];

    Subsubdoc.prepareConditions({subdoc: {$or: [{'doc.name': testDoc.name}, {name: testSubdoc.name}]}}, (err, conditions) => {
      expect(err, JSON.stringify(err)).is.null;

      Subsubdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.name === testDoc.name).map(item => item.id);
        var subdocIds = SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0 || item.name === testSubdoc.name).map(item => item.id);

        expect(docs).to.have.length(SUBSUBDOCS.filter(item => subdocIds.indexOf(item.subdoc.toString()) >= 0).length);

        done(null);
      });
    });
  });

  it('filter by Subsubdoc.subdoc.doc.name OR Subsubdoc.subdoc.name ($or, $eq) #2', done => {
    var testDoc = DOCS[2];
    var testSubdoc = SUBDOCS[1];

    Subsubdoc.prepareConditions({subdoc: {$or: [{'doc.name': {$eq: testDoc.name}}, {name: {$eq: testSubdoc.name}}]}}, (err, conditions) => {
      expect(err, JSON.stringify(err)).is.null;

      Subsubdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.name === testDoc.name).map(item => item.id);
        var subdocIds = SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0 || item.name === testSubdoc.name).map(item => item.id);

        expect(docs).to.have.length(SUBSUBDOCS.filter(item => subdocIds.indexOf(item.subdoc.toString()) >= 0).length);

        done(null);
      });
    });
  });

  it('filter by Subsubdoc.subdoc.doc.name OR Subsubdoc.subdoc.name ($or, $eq) #3', done => {
    var testDoc = DOCS[2];
    var testSubdoc = SUBDOCS[1];

    Subsubdoc.prepareConditions({subdoc: {$or: [{doc: {name: {$eq: testDoc.name}}}, {name: {$eq: testSubdoc.name}}]}}, (err, conditions) => {
      expect(err, JSON.stringify(err)).is.null;

      Subsubdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.name === testDoc.name).map(item => item.id);
        var subdocIds = SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0 || item.name === testSubdoc.name).map(item => item.id);

        expect(docs).to.have.length(SUBSUBDOCS.filter(item => subdocIds.indexOf(item.subdoc.toString()) >= 0).length);

        done(null);
      });
    });
  });

  it('filter by $and: [Subsubdoc.subdoc.doc.name]', done => {
    Subsubdoc.prepareConditions({subdoc: {doc: {$or: [{name: DOCS[0].name}, {name: DOCS[2].name}, {name: DOCS[4].name}]}}}, (err, conditions) => {
      expect(err, JSON.stringify(err)).is.null;

      Subsubdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => [DOCS[0].name, DOCS[2].name, DOCS[4].name].indexOf(item.name) >= 0).map(item => item.id);
        var subdocIds = SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0).map(item => item.id);

        expect(docs).to.have.length(SUBSUBDOCS.filter(item => subdocIds.indexOf(item.subdoc.toString()) >= 0).length);

        done(null);
      });
    });
  });

  it('filter by subdoc.doc.name.$text', done => {
    Subsubdoc.prepareConditions({
      subdoc: {
        doc: {
          $text: {
            $search: DOCS[0].name
          }
        }
      }
    }, (err, conditions) => {
      expect(err, JSON.stringify(err)).is.null;

      Subsubdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => [DOCS[0].name].indexOf(item.name) >= 0).map(item => item.id);
        var subdocIds = SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0).map(item => item.id);

        expect(docs).to.have.length(SUBSUBDOCS.filter(item => subdocIds.indexOf(item.subdoc.toString()) >= 0).length);

        done(null);
      });
    });
  });
});
