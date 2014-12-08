#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var mongojs = require('mongojs');

var app = express();

var mongodbConnectionString = process.env.OPENSHIFT_MONGODB_DB_URL + "cs5610";

if (typeof mongodbConnectionString == "undefined")
{
    mongodbConnectionString = "cs5610";
}

var db = mongojs(mongodbConnectionString, ["dietData"]);


app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());


//----------------------------------------------------


app.get("/serviceClients", function (req, res) 
{
   db.serviceData.find(function (err, docs) {
        res.json(docs);
    });
});

// because it is a post the request is encoded in the body of the http request
//.. and we need to extract it from the body 
app.post("/serviceClients", function (req, res) {

    var svc = req.body;
    // angular doesnot know how to parse the request from the body,   into json.

    // We can use Express to parse the body, and extract the JSON out of the body 
    //console.log(svc);

    db.serviceData.insert(req.body, function (err, doc) {
        res.json(doc);
    });

}); 

app.get("/serviceClients/:id", function (req, res) {
     var anID = req.params.id;
    //console.log(anID);
    db.serviceData.findOne({_id : mongojs.ObjectId(anID)}, 
        function (err, doc ) { 
            res.json(doc );
        });

});



app.put("/serviceClients/:id", function (req, res) {

    var aName = req.body.name;

        db.serviceData.findAndModify(
        {   // Find the object by ID
            query:
            {
                 _id : mongojs.ObjectId(req.params.id)
            },
            update:
            {   // new vals are in req.body, update it's name
                $set:{name: aName}
            },
            // single one
            new: true
        }, 
        function(err, doc, lastErrorObject)
        {   // respond with new document
            
             res.json(doc);
        
        });
});

app.delete("/serviceClients/:id", function (req, res) {
    var anID = req.params.id;
    //console.log(anID.str);
    db.serviceData.remove({_id : mongojs.ObjectId(anID)},
      function (err, doc){
             res.json(doc);
      });
});
//----------------------------------------------------




//--------------------------API CALLS-----------------------
var Nutritionix = require('./lib/nutritionix');
var nutri = new Nutritionix('b5f8b5083afb3bc5e659865b8b003da8','6bf34f20');

//Search for a brand named "inputString"
app.get("/apiSearchBrand/:brandName", function (req, res)
{
    nutri.searchBrand({query:req.params.brandName},function(result)
    {   var jRes = JSON.parse(result);
        res.json(jRes);
    });
});


app.get("/apiSearchForCalories/:cals", function (req, res)
{
    var numOfCals = Number(req.params.cals);
    var halfNumOfCals = (numOfCals * 2)/ 3;
    halfNumOfCals = halfNumOfCals.toString();
    nutri.searchFood({results: '0%3A30', cal_min: halfNumOfCals, cal_max:req.params.cals, fields:'*'},function(result)
    {
         var jRes = JSON.parse(result);
         res.json(jRes);
        //console.log(result);
    });
});


// Put a Diet plan for a user into the database
app.post("/addItemsToDatabase", function (req, res) {

    var svc = req.body;
    // angular doesnot know how to parse the request from the body,   into json.

    // We can use Express to parse the body, and extract the JSON out of the body 
    console.log(svc);

    db.dietData.insert(req.body, function (err, doc) {
        res.json(doc);
    });

}); 

app.get("/existsInDatabase/:date", function (req, res) {
    var aDate = req.params.date;
    db.dietData.findOne({date : aDate}, 
        function (err, doc ) { 
            res.json(doc);
            //console.log(doc);
        });
});


app.delete("/deleteUsingDate/:date", function (req, res) {
    var aDate = req.params.date;
    //console.log(anID.str);
    db.dietData.remove({date : aDate},
      function (err, doc){
             res.json(doc);
      });
});

app.get("/allFromDatabase", function (req, res) {

    db.dietData.find(
        function (err, doc ) { 
            res.json(doc);
        });
});

//------------------PORT----------------------------------

app.get('/env',function(req, res){

    res.json(process.env);
});
     var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
     var port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;
app.listen(port, ipaddress);