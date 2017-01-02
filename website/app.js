/*
    Program     : Amazon Product Tracker 
    Author      : Connor McCann
    Date        : 17 Dec. 2016

    Purpose -

        web server to allow front end tracking of amazon products
        and provide real-time updates to the user. updates database
        of ASIN values for products to be searched and queries the
        DB with the python script which is populating with data on the
        products current state.

    Installs -

        * npm instal express
        * npm instal mysql
        * npm install async
        * npm install ejs
        * npm install morgan
        * npm install body-parser
        * npm install async
*/
var express = require('express');
var app = express();
var db = require('./db');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

// create the model connection for interacting with MySQL
var prodTable = require('./models/prodTable.js');

// server logging
app.use(logger('dev'));

// Create variables for the file location of any routes (connected to views)
var submit = require('./routes/submit.js');
var products = require('./routes/products.js');
var analytics = require('./routes/analytics.js');
app.use('/', submit);
app.use('/products',products);
app.use('/analytics',analytics);

// path to public folder
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware for parsing json post request
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));

// Connect to MySQL on start
db.connect(db.MODE_PRODUCTION, function (err) {
  if (err) {
    console.log('Unable to connect to MySQL.');
    process.exit(1);
  } else {
    app.listen(3000, function () {
    console.log('Listening on *:3000');
    });
    prodTable.createAsinTable(function (err,rez) {
        if(err) {
            console.log('Error creating the ASIN Table');
        } else {
            console.log('Database created');
        }
    });
  }
});

// ----------- DEFINE AJAX POST REQUESTS HERE ----------- //

// saves the data from the form inputs
app.post('/save_asin', function(req,res) {
    if (req.body.asin) {
        var asin = String(req.body.asin);
        var price_point = parseFloat(req.body.price_point).toFixed(2);
        var update = parseInt(req.body.update);

        console.log(asin);
        console.log(price_point);
        console.log(update);

        // check to see if the Product is already in the database
        prodTable.checkForAsin(asin, function (err,rez) {
            if (err) {
                console.log("Error checking for asin");
            } else {
                try {
                    var id = rez[0]["ID"];
                    console.log("the product already exists in the database");
                }
                catch(e) {
                    console.log("the product is not in the database");
                    prodTable.insertData(asin, price_point, update, function (err,rez) {
                        if (err) {
                            console.log('Error Inserting the Data');
                        } else {
                            console.log('Data Inserted Successfully');
                        }
                    });
                }
            }
        });
        
    }
    // send response back to front end so it doesnt hang
    res.send({ some: JSON.stringify({response:'ok'}) });
});

// delete data according to the code from the delete button 
app.post('/delete', function(req,res) {
    if(req.body.asin) {
        var asin = String(req.body.asin);

        // delete prodcut from the ASIN table
        prodTable.deleteFromAsin(asin, function (err,rez) {
            if (err) {
                console.log('error deleting the product');
            } else {
                console.log("successfully deleted the product");
            }
        });

        // delete product from the Products table
        prodTable.deleteFromProducts(asin, function (err,rez) {
            if (err) {
                console.log('error deleting the product');
            } else {
                console.log("successfully deleted the product");
            }
        });

    } else {
        console.log("did not receive asin for delete");
    }
    // send response back to front end so it doesnt hang
    res.send({ some: JSON.stringify({response:'ok'}) });
});

app.post('/get_plot_Data',function(req, res) {
    var name = String(req.body.Name);
    if (name) {
        prodTable.getAllPrices(name, function (err, rez) {
            if (err) {
                console.log("error with get all prices");
                // send response back to front end so it doesnt hang
                res.send({ some: JSON.stringify({response:'failed'}) });
            } else {
                res.send(rez);
            }
        });
    } else {
        console.log("error receiving product analytics name");
    }
});

// get the data to build the product table 
app.get('/get_product_data', function(req,res) {

    prodTable.getAllMostRecent(function (err,rez) {
        if (err) {
            console.log('error with get all SQL');
            // send response back to front end so it doesnt hang
            res.send({ some: JSON.stringify({response:'failed'}) });
        } else {
            // send data back to front end
            res.send(rez);
        }
    });
});

// get a list of product names for the dropdown analytics menu
app.get('/get_product_names', function(req, res) {
    prodTable.getAllNames(function (err,rez) {
        if (err) {
            console.log("error retreiving product names");
            // send response back to front end so it doesnt hang
            res.send({ some: JSON.stringify({response:'failed'}) });
        } else {
            // send data back to front end
            res.send(rez);
        }
    });
});

// get the entire data set from the ASIN table
app.get('/get_price_point', function(req, res) {
    prodTable.getAllFromAsin(function (err, rez) {
        if (err) {
            console.log("error retreiving ASIN data");
            // send response back to front end so it doesnt hang
            res.send({ some: JSON.stringify({response:'failed'}) });
        } else {
            res.send(rez);
        }
    });
});

/*  please make a note to truly understand javascript async call back 
    functions and the ability to pass them as arguments as i am doing
    above to successfully query data and handle errors with a SQL DB
                                ASAP !!! 
*/

// --------- END DEFINE AJAX POST REQUESTS HERE --------- //


module.exports = app;
