var express = require('express');
var app = express();
var path = require('path');
const url = require('url');
// var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var bases = require('bases');
var config = require('./config');
var model = require('./models/model');
var urlShortner = require('./urlshortner');
var urlVisits = require('./urlvisits');

// var counterSchema = new mongoose.Schema({
//     _id: { type: String, required: true },
//     seq: {type: Number, default: 0 }
// });

//mongod.exe -port 27998 -dbpath "C:\Users\parfa\OneDrive\Documents\aots link shortner\mongo\data\db"
var Counter = model.Counter;//the model for the counter
var Urlmodel = model.Url; //the model for the url
var Visit = model.Visit;
var urlCounter = new Counter({'_id': 'url_seq', 'seq': 1000});
// console.log("***********************************************************************");
// console.log("COUNTER: " + urlCounter.seq);
// console.log("***********************************************************************");
mongoose.connect('mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name);

// urlCounter.save(function (err) {
//     if (err) return console.error(err);
//     console.log("-------------------------------------------------------------------");
//     console.log("SAVED COUNTER AGAIN");
//     console.log("------------------------------------------------------------------");
// });


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("***********************************************************************");
  console.log("Connected To the database");
  console.log("***********************************************************************");
});



app.get('/', function (req, res) {
        res.send('URL SHORTNER!');
});

//http://localhost:5000/api/shortened?url=
app.get('/api/shortened', function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  console.log("Request url: " + req.url);
  console.log("URL OBJECT: " + JSON.stringify(urlObj.query.url));
  urlShortner.shortnedURL(urlObj.query.url, (err, shortURL) =>{

    if (err) {
      console.log(err);
    }else{
      console.log("NEW SHORTNED URL: " + shortURL);
    }
  });
  res.send('Creating URL');
});
//https://stackfame.com/get-ip-address-node
app.get('/:usr/:encoded_id', function (req, res){
  var username = req.params.usr;
  console.log('user: ', username)
  var link_name = req.params.encoded_id;
  console.log('encoded_id: ', link_name)
  //var clientIP = req.header('x-forwarded-for') || req.connection.remoteAddress;
var clientIP = '5.5.5.5';
  Urlmodel.findOne({'link_name': link_name}, (err, doc) => {

    if (err){
      console.log("NO LINK FOUND _________________++++++++++++++++++++++++");
      console.log(err);
    }else{
      console.log("LINK FOUND: "+ doc);
      if(doc){
        var visit_details = {
          "ip":clientIP,
          "url_id":doc.id,
          "hostname":req.hostname,
        };
        if(doc.original_url.startsWith("https://") || doc.original_url.startsWith("http://")){
            res.redirect(doc.original_url);
        }else{
            res.redirect("http://"+doc.original_url)
        };

        urlVisits.newVisit(visit_details);

      }
    }
  });
});

//Route for Table 1
app.get('/api/urls/table1/:platform', function (req, res){
  console.log("API API API");
  res.send("API API API");
  var arr = Urlmodel.aggregate([
            {
              $lookup: {
                from: "visits",
                localField: "custom_url",
                foreignField: "url_id",
                as: "url_visits"
              }
            }
            ,
            {
              $unwind: "$url_visits"
            }
            ,
            {
              $group: {
                _id: "$url_visits",
              }
            }
          ])
          .exec(function (err,result){
              if(err) throw Error;
              console.log(result);
          });

  //console.log(JSON.stringify(arr, null, 4));
});

app.get('api/urls/table1/expanded/:id', function (req, res){

});

app.get('api/urls/table2/:id', function (req, res){

});

app.get('api/urls/table2/expanded/:id', function (req, res){

});

app.get('api/urls/graphs/all/', function (req, res){

});

app.get('api/urls/graphs/:id', function (req, res){

});


app.listen(5000, function () {
  console.log('Listening on port 5000');
  console.log('http://localhost:5000');
});
