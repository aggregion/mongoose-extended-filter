'use strict';

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const helper = require('./helper');
const faker = require('faker');
const chai = require('chai');
const expect = chai.expect;
const Doc = require('./models/doc.model');

describe('1 level', function() {
  let docs = [];

  before(() =>
    helper.promiseSeries([
      helper.connectToDb(),
      helper.times(10, () => {
        return new Doc({
          name: faker.name.firstName(),
          path: {
            subpath: {
              name: faker.name.firstName()
            }
          }
        })
        .save();
      })
    ])
    .then(saved => {
      docs = saved;
    })
  );

  after(() => helper.promiseSeries([
    Doc.remove(),
    helper.disconnectFromDb()
  ]));

  it('simple filter by Doc.name', () => {
    const testDoc = docs[1];

    return Doc.prepareConditions({name: testDoc.name})
      .then(conditions => Doc.find(conditions))
      .then(doc => {
        expect(doc).to.be.an('array');
        expect(doc).to.have.length(docs.filter(item => item.name === testDoc.name).length);
      });
  });

  it('simple filter by Doc.path.subpath.name', () => {
    const testDoc = docs[1];

    return Doc.prepareConditions({'path.subpath.name': testDoc.path.subpath.name})
      .then(conditions => Doc.find(conditions))
      .then(doc => {
        expect(doc).to.be.an('array');
        expect(doc).to.have.length(docs.filter(item => item.path.subpath.name === testDoc.path.subpath.name).length);
      });
  });

  it('filter with $regex', () => {
    const testDoc = docs[1];
    const name = testDoc.path.subpath.name;

    return Doc.prepareConditions({$and: [
      {
        'path.subpath.name': name
      },
      {
        'path.subpath.name': {
          $regex: new RegExp(name.slice(0, Math.round(name.length / 2)) + '.*' + name.slice(Math.round(name.length / 2) + 1), 'i')
        }
      }
    ]})
      .then(conditions => Doc.find(conditions))
      .then(doc => {
        expect(doc).to.be.an('array');
        expect(doc).to.have.length(docs.filter(item => item.path.subpath.name === testDoc.path.subpath.name).length);
      });
  });
});
