var mongoose = require('mongoose');
var config = require('..\\config.js');
//var config = {};
/* config.db = {};
config.webhost = 'http://localhost:27998/'

config.db.host = 'localhost';
config.db.name = 'shortned_urls';
config.db.port = '27998'; */
var ObjectId = mongoose.Schema.ObjectId;

console.log(config);
mongoose.connect('mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name);
var _visitSchema = new mongoose.Schema({
  // _id: {type: text, index: true},
  ip: String,
  url_id: {type: ObjectId, index: true},
  region: String,
  region_code: String,
  city: String,
  country: String,
  country_name: String,
  continent_code: String,
  postall: String,
  latitude: String,
  longitude: String,
  hostname:String,
  visit_time: { type: Date, default: Date.now },
  timezone:String,
  utc_offset: String,
  organization: String
});

//_visitorSchema
var _counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: {type: Number, default: 0 }
});



var _urlSchema = new mongoose.Schema({
  // _id: {type: String, index: true},
  hash: { type: Number, default: 0 },
  original_url: String,
  generated_url: String,// ht....aio/a/arec
  custom_url: String,// ht....ats.io/ducongo/cool
  creation_date: { type: Date, default: Date.now },
  latest_visit_date: Date,
  platform: String,
  username: String,
  link_name: String,
  link_title: String
});


var _Counter = mongoose.model('counter', _counterSchema);
var _Url = mongoose.model('url', _urlSchema);
var _visit = mongoose.model('visit', _visitSchema);

module.exports = {
  Counter: _Counter,
  Url : _Url,
  Visit: _visit,
  counterSchema: _counterSchema,
  urlSchema: _urlSchema
}
































//
