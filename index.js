var express = require('express');
var app = express();
var path = require('path');
const url = require('url');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var bases = require('bases');
var config = require('./config');
var model = require('./models/model');
var urlShortner = require('./urlshortner');
var counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: {type: Number, default: 0 }
});

//mongod.exe -port 27998 -dbpath "C:\Users\parfa\OneDrive\Documents\aots link shortner\mongo\data\db"
var Counter = model.Counter;//the model for the counter
var Url = model.Url; //the model for the url
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

app.get('/:usr/:encoded_id', function (req, res){
  var nick_name = req.params.usr;
  console.log('user: ', user)
  var link_name = req.params.encoded_id;
  console.log('encoded_id: ', link_name)
  Url.findOne({'nick_name' : nick_name, 'link_name': link_name}, (err, doc) => {

    if (err){

    }else{
      if(doc){
        if(doc.original_url.startsWith("https://") || doc.original_url.startsWith("http://")){
            res.redirect(doc.original_url);
        }else{
            res.redirect("http://"+doc.original_url)
        };

      }
    }
  });
});



app.listen(5000, function () {
  console.log('Listening on port 5000');
  console.log('http://localhost:5000');
});
