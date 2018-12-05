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

 var counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: {type: Number, default: 0 }
 });

//mongod.exe -port 27998 -dbpath "C:\Users\parfa\OneDrive\Documents\aots link shortner\mongo\data\db"
var Counter = model.Counter;//the model for the counter
var Urlmodel = model.Url; //the model for the url
var Visit = model.Visit;
var urlCounter = new Counter({'_id': 'url_seq', 'seq': 1000});
// console.log("***********************************************************************");
// console.log("COUNTER: " + urlCounter.seq);
// console.log("***********************************************************************");
mongoose.connect('mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name);

urlCounter.save(function (err) {
     if (err) return console.error(err);
     console.log("-------------------------------------------------------------------");
     console.log("SAVED COUNTER AGAIN");
     console.log("------------------------------------------------------------------");
 });


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
              $lookup: {  /* this will retrieve all visits sorted by urls */
                from: "visits",
                localField: "_id",
                foreignField: "url_id",
                as: "url_visits"
              }
            }
            ,
            {		/* this will make each visit nested object its own element*/
              $unwind: "$url_visits"
            }
            ,
            {
              $group: { /* this will group all unique visits by IP and hostname (other variables can also be added later), then sums the total views / unique visit as variable count */
                _id: {visit: "$url_visits.ip",hostname: "$url_visits.hostname"},
				
				count: { $sum: 1 }
              }
            }
       ])
          .exec(function (err,result){
              if(err) throw Error;
              console.log(result);
			  var total_visits = function(items, visit_count){
					return items.reduce( function(a, b){
						return a + b[visit_count];
					}, 0);
				};
				console.log("Total visits: "+total_visits(result,'count'));
				console.log("Unique visits: "+result.length);
          });
		 
  //console.log(JSON.stringify(arr, null, 4));
});

app.get('/api/urls/findinfo/', function (req, res){
  console.log("API API API");
  res.send("API API API");
  var arr = Urlmodel.aggregate([
            {
              $lookup: {  /* this will retrieve all visits sorted by urls */
                from: "visits",
                localField: "_id",
                foreignField: "url_id",
                as: "url_visits"
              }
            }
            ,
            {		/* this will make each visit nested object its own element*/
              $unwind: {
                path: "$url_visits",
              "preserveNullAndEmptyArrays": true
            }
            }
            ,
            {
              $group: { /* this will group all unique visits by IP and hostname (other variables can also be added later), then sums the total views / unique visit as variable count */
                _id: {url_id: "$_id",linkname: "$custom_url",link_title:"$link_title",original_url:"$original_url"},
                  visit_count: { $sum: 1 },
                  unique_visits: {$addToSet: "$url_visits.ip"},
                  last_visited : { $last: "$url_visits.visit_time"}
              }
            },
            {
              $project: {
              _id: 1,
              link_title: 1,
              original_url: 1,
              visit_count: 1,
              unique_visits: {$size: "$unique_visits"}
            }
          }

       ])
          .exec(function (err,result){
              if(err){
                console.log(err.stack);
                throw Error;
              }
              console.log(result);
			  var total_visits = function(items, visit_count){
					return items.reduce( function(a, b){
						return a + b[visit_count];
					}, 0);
				};
				console.log("Total visits: "+total_visits(result,'count'));
				console.log("Unique visits: "+result.length);
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

/*This takes in a url id, start date and end date and spits out
json data that can generate a graph by calling c3.generateGraph(response)*/
app.get('/api/urls/graphs/:id/:start/:end', function (req, res){
  console.log("API API API");
  //res.send("API API API");
  let start = new Date(req.params.start); //receives start date in %Y-%m-%d form
  let end = new Date(req.params.end); //receives end date in %Y-%m-%d form
  let url_id = req.params.id; //receives the url id
  let ObjectId = mongoose.Types.ObjectId(url_id);
  let dayList = [];
  let totalVisitList = [];
  let uniqueVisitList = [];
  console.log('got here')
  //need to use aggregate to format date
  var arr = Visit.aggregate([
    {/*this limits the query by the start and end date, and by the url id */
      $match: {
        "visit_time": { $gte: start, $lte: end },
        "url_id": { $eq: ObjectId }
      }
    },
    {/*this projects the array of dates into a string, it also projects the ips for catching unique visits*/
      $project: {
        "visit_time": 1,
        visitedAtDay: { "$dateToString": { "format": "%Y-%m-%d", "date": "$visit_time" } },
        "ip": 1,
        "url_id": 1
      }
    },
    {/*this groups the data together and sums up the visits per day*/
      $group: {
        _id: { visit_time: "$visitedAtDay" },
        unique_visits: { $addToSet: "ip" },
        urls: { $addToSet: "url_id" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ]).exec(function (err, result) {
    if (err) throw Error;
    console.log(result);

    dayList = [result.length + 1];
    totalVisitList = [result.length + 1];
    uniqueVisitList = [result.length + 1];

    for (var i = 1; i < result.length + 1; i++) {
      dayList[i] = result[i - 1]._id.visit_time;
      totalVisitList[i] = result[i - 1].count;
      uniqueVisitList[i] = result[i - 1].unique_visits.length;
    }
    dayList[0] = 'x';
    uniqueVisitList[0] = 'Unique Visits';
    totalVisitList[0] = 'Total Visits';

    console.log("listOfDays: ", dayList);
    console.log("listOfTotalVisits: ", totalVisitList);
    console.log("listOfUniqueVisits: ", uniqueVisitList);

    /*give a json response of the graph data to be generated by c3.generateGraph(response)*/
    res.json({
      data: {
        x: 'x',
        columns: [
          dayList,
          uniqueVisitList,
          totalVisitList
        ],
        type: 'bar'
      },
      bar: {
        width: {
          ratio: 0.5
        }
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%Y/%m/%d'
          }
        }
      }
    });
  });
});

/*This takes in a url id, start date an end date, a start hour, and end hour
and spits out json data that can generate a graph by calling
c3.generateGraph(response)*/
app.get('/api/urls/graphs/:id/:start/:end/:begh/:endh', function (req, res){
  console.log("API API API");
  //res.send("API API API");
  let url_id = req.params.id; //receives the url id
  let ObjectId = mongoose.Types.ObjectId(url_id);
  let dayList = [];
  let totalVisitList = [];
  let uniqueVisitList = [];
  console.log('got here')
  //need to use aggregate to format date
  let arr = Visit.aggregate([
    {/*this limits the query by the start and end date
      start and end hour, and by the url id */
      $redact: {
        $cond: [
          {
            $and: [
              { $gte: [ "$visit_time", new Date(req.params.start) ] },
              { $lte : [ "$visit_time", new Date(req.params.end) ] },
              { $gte: [ { "$hour": "$visit_time" }, parseInt(req.params.begh) ] },
              { $lte: [ { "$hour": "$visit_time" }, parseInt(req.params.endh) ] },
              { $eq: [ "$url_id", ObjectId ] }
            ]
          },
          "$$KEEP",
          "$$PRUNE"
        ]
      }
    },
    {/*this projects the array of dates into a string, it also projects the ips for catching unique visits*/
      $project: {
        "visit_time": 1,
        visitedAtDay: { "$dateToString": { "format": "%Y-%m-%d", "date": "$visit_time" } },
        "ip": 1,
        "url_id": 1
      }
    },
    {/*this groups the data together and sums up the visits per day*/
      $group: {
        _id: { visit_time: "$visitedAtDay" },
        unique_visits: { $addToSet: "ip" },
        urls: { $addToSet: "url_id" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ]).exec(function (err, result) {
    if (err) throw Error;
    console.log(result);
    dayList = [result.length + 1];
    totalVisitList = [result.length + 1];
    uniqueVisitList = [result.length + 1];

    for (var i = 1; i < result.length + 1; i++) {
      dayList[i] = result[i - 1]._id.visit_time;
      totalVisitList[i] = result[i - 1].count;
      uniqueVisitList[i] = result[i - 1].unique_visits.length;
    }
    dayList[0] = 'x';
    uniqueVisitList[0] = 'Unique Visits';
    totalVisitList[0] = 'Total Visits';

    console.log("listOfDays: ", dayList);
    console.log("listOfTotalVisits: ", totalVisitList);
    console.log("listOfUniqueVisits: ", uniqueVisitList);

    /*give a json response of the graph data to be generated by c3.generateGraph(response)*/
    res.json({
      data: {
        x: 'x',
        columns: [
          dayList,
          uniqueVisitList,
          totalVisitList
        ]
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%A'
          }
        }
      }
    });
  });
});

app.listen(5000, function () {
  console.log('Listening on port 5000');
  console.log('http://localhost:5000');
});
