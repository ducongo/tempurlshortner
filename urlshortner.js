var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var bases = require('bases');
var config = require('./config');
var model = require('./models/model');

mongoose.connect('mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name);


//mongoose models
var Url = model.Url;
var Counter = model.Counter;

var shortnedURL = (longURL, callback) =>{
  //check to see if the url already exist
  Url.findOne({'original_url' : longURL}, (err, url) => {
    //if it doesn't exist then create a new shortned url
    if (err){
      console.log(err);
    }else{
      if (url == null){
        console.log("Generating new shorten url");
        model.Counter.findByIdAndUpdate('url_seq', {$inc: { seq: 1 }}, function(err, counter, next) {
          if(err) return next(err);
          createShortenedURL(counter.seq, longURL, (err, shortURL ) => {
            callback(err, shortURL);
          });
        });
      }else{
        callback(err, url.custom_url);
      }
    }
  });
}

function createShortenedURL(counter, longURL, callback){
  var shortenURL = new Url({
    'hash': counter,
    'original_url': longURL,
    'generated_url': 'http://localhost:5000/dcg/' + bases.toBase64(counter),
    'custom_url': 'http://localhost:5000/dcg/' + bases.toBase64(counter),
    'platform': 'instagram',
    'visits_key': '0',
    'nick_name': 'ducongo',
    'link_name': bases.toBase64(counter)
  });

  shortenURL.save(function (err) {
    if (err){
      callback(err, shortenURL.custom_url);
      return console.error(err);
    }
    console.log("-------------------------------------------------------------------");
    console.log('\x1b[36m%s\x1b[0m', "SAVED URL: " + shortenURL.custom_url);
    console.log("------------------------------------------------------------------");
    callback(null, shortenURL.custom_url);
  });

}

module.exports = {
  shortnedURL: shortnedURL,
}
