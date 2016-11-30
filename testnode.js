/**
 * Created by mczyz on 30/11/16.
 */

var PouchDB = require('pouchdb'),
    Q = require('q'),
    numberOfDocuments = 5000,
    localDb,
    queryTime;

function callWithLog(fn, message) {
    console.log(message + ' ' + (new Date().toLocaleTimeString()));
    return fn().then(function () {
        console.log('DONE ' + (new Date().toLocaleTimeString()));
    });
}

function createDatabase () {
    localDb = new PouchDB('LOCALDB');
    return Q.when();
}

function destroyDatabase () {
    return localDb.destroy();
}

function addData () {
    var i,
        allAdditions = [];
    for (i = 0; i < numberOfDocuments; i++) {
        doc = {
            "_id": "TestDoc" + i,
            "title": "TestTitle" + i
        };
        allAdditions.push(localDb.put(doc));
    }
    return Q.all(allAdditions);
}

function addView () {
    var ddoc = {
        _id: '_design/testdoc',
        views: {
            testdoc: {
                map: function mapFun(doc) {
                    if (doc.title) {
                        emit(doc.title);
                    }
                }.toString()
            }
        }
    };
    // save the design doc
    return localDb.put(ddoc);
}

function queryDb () {
    var startTime = new Date();
    return localDb.query('testdoc', {
        limit: 100,
        include_docs: true
    }).then(function (result) {
        var endTime = new Date();
        queryTime = (endTime.getTime() - startTime.getTime()) / 1000;
        console.log('Got result with ' + result.rows.length + ' rows');
    }).catch(function (err) {
        console.log('Got error ' + err);
    });
}


callWithLog(createDatabase, 'Create database')
    .then(function () {
        return callWithLog(addData, 'Add data');
    })
    .then(function () {
        return callWithLog(addView, 'Add view');
    })
    .then(function () {
        return callWithLog(queryDb, 'Query view');
    })
    .then(function () {
        return callWithLog(destroyDatabase, 'Destroy db');
    })
    .then(function () {
        console.log('Executed query in ' + queryTime + 's');
    });