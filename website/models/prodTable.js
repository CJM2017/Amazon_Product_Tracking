// script to hold all of the database queries/insertions for product information 
var db = require('../db.js');

// Query to create ASIN database 
exports.createAsinTable = function (done) {
    db.get().query('CREATE TABLE IF NOT EXISTS ASIN(ID int NOT NULL AUTO_INCREMENT,Primary KEY (ID), Asin varchar(50), Price_Point float(2), Text_Response int);', function (err, rows) {
        if (err) return done(err);
        done(null, rows);
    });
};

// Query to store user products from webpage *** BUT FIRST CHECK THAT IT IS NOT IN THE TABLE ALREADY
exports.checkForAsin = function (asin, done) {
    db.get().query('SELECT ID FROM ASIN WHERE Asin = ?',asin, function (err, rows) {
        if (err) return done(err);
        done(null, rows);
    });
};

// Query to store user products from webpage *** BUT FIRST CHECK THAT IT IS NOT IN THE TABLE ALREADY
exports.insertData = function (asin, price_point, text_response, done) {
    values = [asin, price_point, text_response];
    db.get().query('INSERT INTO ASIN (Asin, Price_Point, Text_Response) VALUES(?, ?, ?)', values, function (err, rows) {
        if (err) return done(err);
        done(null, rows);
    });
};

// Query from Products table 
exports.getAllMostRecent = function (done) {
    db.get().query('SELECT * FROM Products WHERE ID > (SELECT max(ID)-(SELECT count(DISTINCT Code) FROM Products) FROM Products)', function (err, rows) {
        if (err) return done(err);
        done(null, rows);
    });
};

// Querey to delete from ASIN table so future updates do not occur
exports.deleteFromAsin = function (asin, done) {
    db.get().query('DELETE FROM ASIN WHERE Asin = ?', asin, function (err,rows) {
        if (err) return done(err);
        done(null,rows);
    });
};

// Query to delete all current from data from the Products table
exports.deleteFromProducts = function (asin, done) {
    db.get().query('DELETE FROM Products WHERE Code = ?', asin, function (err,rows) {
        if (err) return done(err);
        done(null,rows);
    });
};

// Query to get the (X,Y) data for analytics plot----------------
exports.getAllPrices = function (name, done) {
    db.get().query('SELECT Original_Price, InsertionTime FROM Products WHERE Name = ?', name, function (err,rows) {
        if (err) return done(err);
        done(null,rows);
    });
};

// Query to get all of the possible product names for the analytics drop down menu----------------------
exports.getAllNames = function (done) {
    db.get().query('SELECT DISTINCT Name FROM Products', function (err,rows) {
        if (err) return done(err);
        done(null,rows);
    });
};

// Query to get all the data from the ASIN table
exports.getAllFromAsin = function (done) {
    db.get().query('SELECT * FROM ASIN', function (err,rows) {
        if (err) return done(err);
        done(null,rows);
    });
};
