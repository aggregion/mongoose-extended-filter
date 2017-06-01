'use strict';

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

var helper = require('./helper');
var faker = require('faker');
var chai = require('chai');
var expect = chai.expect;
var Doc = require('./models/doc.model');
var Subdoc = require('./models/subdoc.model');

describe('2 level', () => {
  let DOCS = [];
  let SUBDOCS = [];

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
                doc: doc._id,
                docPathAsSchema: {
                  doc: doc._id
                },
                path: {
                  subpath: {
                    doc: doc._id
                  }
                }
              }))
            );
          })
          .then(saved => (SUBDOCS = saved))
      ])
  );

  after(() => helper.promiseSeries([
    Doc.remove(),
    Subdoc.remove(),
    helper.disconnectFromDb()
  ]));

  it('simple filter by Subdoc.name', done => {
    var testSubdoc = SUBDOCS[1];

    Subdoc.find({name: testSubdoc.name}, (err, docs) => {
      expect(err).is.null;
      expect(docs).to.be.an('array');
      expect(docs).to.have.length(SUBDOCS.filter(item => item.name === testSubdoc.name).length);

      done(null);
    });
  });

  it('simple filter by Subdoc.doc', done => {
    var testSubdoc = SUBDOCS[1];

    Subdoc.prepareConditions({doc: testSubdoc.doc}, (err, conditions) => {
      expect(err).is.null;

      Subdoc.find(conditions, (err, docs) => {
        expect(err, JSON.stringify(err)).is.null;
        expect(docs).to.be.an('array');
        expect(docs).to.have.length(SUBDOCS.filter(item => item.id === testSubdoc.id).length);

        done(null);
      });
    });
  });

  it('filter by Subdoc.doc.name', done => {
    var testDoc = DOCS[1];

    Subdoc.prepareConditions({'doc.name': testDoc.name}, (err, conditions) => {
      expect(err).is.null;

      Subdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.name === testDoc.name).map(item => item.id);

        expect(docs).to.have.length(SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0).length);

        done(null);
      });
    });
  });

  it('filter by Subdoc.doc.path.subpath.name', done => {
    var testDoc = DOCS[1];

    Subdoc.prepareConditions({'doc.path.subpath.name': testDoc.path.subpath.name}, (err, conditions) => {
      expect(err).is.null;

      Subdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.path.subpath.name === testDoc.path.subpath.name).map(item => item.id);

        expect(docs).to.have.length(SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0).length);

        done(null);
      });
    });
  });

  it('filter by Subdoc.path.subpath.doc.name', done => {
    var testDoc = DOCS[1];

    Subdoc.prepareConditions({'path.subpath.doc.name': testDoc.name}, (err, conditions) => {
      expect(err).is.null;

      Subdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.name === testDoc.name).map(item => item.id);

        expect(docs).to.have.length(SUBDOCS.filter(item => docIds.includes(item.doc.toString())).length);

        done(null);
      });
    });
  });

  it('filter by Subdoc.docPathAsSchema.doc.name', done => {
    var testDoc = DOCS[1];

    Subdoc.prepareConditions({'docPathAsSchema.doc.name': testDoc.name}, (err, conditions) => {
      expect(err).is.null;

      Subdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.name === testDoc.name).map(item => item.id);

        expect(docs).to.have.length(SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0).length);

        done(null);
      });
    });
  });

  it('filter by Subdoc.docPathAsSchema.doc.name AND Subdoc.name', done => {
    var testDoc = DOCS[1];
    var testSubdoc = SUBDOCS.find(item => String(item.docPathAsSchema.doc) === testDoc.id);

    Subdoc.prepareConditions({
      'docPathAsSchema.doc.name': testDoc.name,
      'name': testSubdoc.name
    }, (err, conditions) => {
      expect(err).is.null;

      Subdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(
          item => item.name === testDoc.name
        ).map(item => item.id);

        expect(docs).to.have.length(SUBDOCS.filter(item => docIds.includes(item.doc.toString()) && item.name === testSubdoc.name).length);

        done(null);
      });
    });
  });

  it('filter by Subdoc.doc.path.subpath.name AND Subdoc.doc.name', done => {
    var testDoc = DOCS[1];

    Subdoc.prepareConditions({
      'doc.path.subpath.name': testDoc.path.subpath.name,
      'doc.name': testDoc.name
    }, (err, conditions) => {
      expect(err).is.null;

      Subdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(
          item => item.name === testDoc.name && item.path.subpath.name === testDoc.path.subpath.name
        ).map(item => item.id);

        expect(docs).to.have.length(SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0).length);

        done(null);
      });
    });
  });

  it('filter by Subdoc.doc{name} by promise', done => {
    var testDoc = DOCS[1];

    Subdoc.prepareConditions({doc: {name: testDoc.name}}, (err, conditions) => {
      expect(err).is.null;

      /* eslint-disable array-callback-return */
      Subdoc.find(conditions).find((err, docs) => {
        expect(err, JSON.stringify(err)).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.name === testDoc.name).map(item => item.id);

        expect(docs).to.have.length(SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0).length);

        done(null);
      });
      /* eslint-enable array-callback-return */
    });
  });

  it('filter by Subdoc.doc{name}', done => {
    var testDoc = DOCS[1];

    Subdoc.prepareConditions({doc: {name: testDoc.name}}, (err, conditions) => {
      expect(err).is.null;

      Subdoc.find(conditions, (err, docs) => {
        expect(err, JSON.stringify(err)).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.name === testDoc.name).map(item => item.id);

        expect(docs).to.have.length(SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0).length);

        done(null);
      });
    });
  });

  it('filter by Subdoc.doc.path.subpath.name ($eq)', done => {
    var testDoc = DOCS[1];

    Subdoc.prepareConditions({'doc.path.subpath.name': {$eq: testDoc.path.subpath.name}}, (err, conditions) => {
      expect(err).is.null;

      Subdoc.find(conditions, (err, docs) => {
        expect(err).is.null;
        expect(docs).to.be.an('array');

        var docIds = DOCS.filter(item => item.path.subpath.name === testDoc.path.subpath.name).map(item => item.id);

        expect(docs).to.have.length(SUBDOCS.filter(item => docIds.indexOf(item.doc.toString()) >= 0).length);

        done(null);
      });
    });
  });
});
