var express = require('express');
var app = express();
//var path = require('path');
const url = require('url');
// var bodyParser = require('body-parser');
var mongoose = require('mongoose');
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
/*app.get('/api/urls/graphs/:id/:start/:end', function (req, res){
  console.log("API API API");
  //res.send("API API API");
  var start = new Date(req.params.start); //receives start date in %Y-%m-%d form
  var end = new Date(req.params.end); //receives end date in %Y-%m-%d form
  var url_id = req.params.id; //receives the url id
  var ObjectId = mongoose.Types.ObjectId(url_id);
  var dayList = [];
  var totalVisitList = [];
  var uniqueVisitList = [];
  //need to use aggregate to format date
  Visit.aggregate([
    {/*this limits the query by the start and end date, and by the url id */
  /*    $match: {
        "visit_time": { $gte: start, $lte: end },
        "url_id": { $eq: ObjectId }
      }
    },
    {/*this projects the array of dates into a string, it also projects the ips for catching unique visits*/
  /*    $project: {
        "visit_time": 1,
        visitedAtDay: { "$dateToString": { "format": "%Y-%m-%d", "date": "$visit_time" } },
        "ip": 1,
        "url_id": 1
      }
    },
    {/*this groups the data together and sums up the visits per day*/
  /*    $group: {
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
    /*res.json({
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

EARLIER GRAPH HAS BECOME DEPRECATED, NEW GRAPH ARRAY HANDLES BOTH IN ONE QUERY.

/*This takes in a url id, start date and end date, and a start hour and end hour
and spits out json data that can generate a graph by calling c3.generateGraph(response)
e.g. http://localhost:5000/api/urls/graphs/5bd7640b054ed60c647cb8de/2018-10-28/2018-11-03/10/20/*/
app.get('/api/urls/graphs/:id/:start/:end/:begH/:endH', function (req, res){
  console.log("API API API");
  //res.send("API API API");
  var urlId = mongoose.Types.ObjectId(req.params.id);
  var begH = parseInt(req.params.begH);
  var endH = parseInt(req.params.endH);
  var hourList = [];
  var totalVisitList = [];
  var dateList = [];
  var uniqueVisitList = [];
  console.log('got here')
  //need to use aggregate to format date
  Visit.aggregate([
    {/*this limits the query by the start and end date
      start and end hour, and by the url id */
      $redact: {
        $cond: [
          {
            $and: [
              { $gte: [ "$visit_time", new Date(req.params.start) ] },
              { $lte : [ "$visit_time", new Date(req.params.end) ] },
              { $gte: [ { "$hour": "$visit_time" }, begH ] },
              { $lte: [ { "$hour": "$visit_time" }, endH ] },
              { $eq: [ "$url_id", urlId ] }
            ]
          },
          "$$KEEP",
          "$$PRUNE"
        ]
      }
    },
    {/*this projects the array of dates into a string, and projects the visiting ip, and the id of the url*/
      $project: {
        "visit_time": 1,
        visitedAtDate: { "$dateToString": {"format": "%Y-%m-%d", "date": "$visit_time"}},
        visitedAtDay: { "$dateToString": {"format": "%w", "date": "$visit_time"}},
        visitedAtHour: { "$dateToString": {"format": "%H", "date": "$visit_time"}},
        "ip": 1,
        "url_id": 1
      }
    },
    {/*this groups the data together and sums up the visits per unique Day of Week + Hour combo 
      (makes counting visits on a certain day of the week at a specific hour simple)*/
      $group: {
        _id: { visit_dow: "$visitedAtDay",
               visit_hour: "$visitedAtHour",
               visit_date: "$visitedAtDate"},
        unique_visits: { $addToSet: "$ip" },
        urls: { $addToSet: urlId },
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
    hourList = [result.length + 1];
    dateList = [result.length + 1];
    totalVisitList = [result.length + 1];
    uniqueVisitList = [result.length + 1];
    var hourRange = Array(endH + 1 - begH).fill().map((x, y) => (y + begH));
    hourRange.unshift('x');
    console.log('hourRange: ', hourRange);

    var sundayList = ["Sunday"].concat(Array(hourRange.length).fill(0));
    var mondayList = ["Monday"].concat(Array(hourRange.length).fill(0));
    var tuesdayList = ["Tuesday"].concat(Array(hourRange.length).fill(0));
    var wednesdayList = ["Wednesday"].concat(Array(hourRange.length).fill(0));
    var thursdayList = ["Thursday"].concat(Array(hourRange.length).fill(0));
    var fridayList = ["Friday"].concat(Array(hourRange.length).fill(0));
    var saturdayList = ["Saturday"].concat(Array(hourRange.length).fill(0));

    var indexesToRemove = [];
    var totalVisitIndexesToRemove = [];

    for (var i = 0; i < result.length; i++) {
      dateList[i] = result[i]._id.visit_date;
      
      hourList[i] = parseInt(result[i]._id.visit_hour);
      totalVisitList[i] = result[i].count;
      uniqueVisitList[i] = result[i].unique_visits.length;

      switch(parseInt(result[i]._id.visit_dow)) {
        case 1: sundayList[hourRange.indexOf(hourList[i])] = totalVisitList[i];
              break;
        case 2: mondayList[hourRange.indexOf(hourList[i])] = totalVisitList[i];
              break;
        case 3: tuesdayList[hourRange.indexOf(hourList[i])] = totalVisitList[i];
              break;
        case 4: wednesdayList[hourRange.indexOf(hourList[i])] = totalVisitList[i];
              break;
        case 5: thursdayList[hourRange.indexOf(hourList[i])] = totalVisitList[i];
              break;
        case 6: fridayList[hourRange.indexOf(hourList[i])] = totalVisitList[i];
              break;
        case 7: saturdayList[hourRange.indexOf(hourList[i])] = totalVisitList[i];
              break;
      }
      if(i > 0) {
        if(dateList[i] == dateList[i - 1]) {
          var uniqueVisitSet = new Set();
          uniqueVisitSet.add(result[i].unique_visits);
          uniqueVisitSet.add(result[i - 1].unique_visits);
          uniqueVisitList[i] = uniqueVisitSet.length;
          totalVisitList[i] = totalVisitList[i] + totalVisitList[i - 1];
          indexesToRemove.push(i);
          totalVisitIndexesToRemove.push(i - 1);
        }
      }
    }

    console.log("Indexes to remove: ", indexesToRemove);

    while(indexesToRemove.length > 0) {
      uniqueVisitList.splice(indexesToRemove[0], 1);
      totalVisitList.splice(totalVisitIndexesToRemove[0], 1);
      dateList.splice(indexesToRemove[0], 1);
      indexesToRemove.splice(0, 1);
      totalVisitIndexesToRemove.splice(0, 1);
      indexesToRemove = indexesToRemove.map(function(value) {
        return value - 1;
      });
      totalVisitIndexesToRemove = totalVisitIndexesToRemove.map(function(value) {
        return value - 1;
      });
    }

    dateList.unshift('x');
    uniqueVisitList.unshift('Unique Visits');
    totalVisitList.unshift('Total Visits');

    /*give a json response of the graph data to be generated by c3.generateGraph(response)*/
    res.json([{
      data: {
        x: 'x',
        columns: [
          hourRange,
          sundayList,
          mondayList,
          tuesdayList,
          wednesdayList,
          thursdayList,
          fridayList,
          saturdayList,
        ],
        type: 'area'
      }
    },{
      data: {
        x: 'x',
        columns: [
          dateList,
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
    }]);
  });
});

/* These would generate their respective pie charts with
c3.generateGraph(response); when a specified url id is given*/
/*app.get('/api/urls/graphs/:id', function (req, res) {
  console.log('API API API');
  var urlId = req.params.id; //receives the url id
  var urlObjectId = mongoose.Types.ObjectId(urlId);
  var countryVisitCounts = Visit.aggregate().exec(function(err, result) {
    if(err) throw err;
    console.log(result);
  });
  var cityVisitCounts = Visit.aggregate().exec(function(err, result) {
    if(err) throw err;
    console.log(result);
  });
  var platformVisitCounts = Visit.aggregate().exec(function(err, result) {
    if(err) throw err;
    console.log(result);
  });

  res.json({

  });
});*/

app.listen(5000, function () {
  console.log('Listening on port 5000');
  console.log('http://localhost:5000');
});