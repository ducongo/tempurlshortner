var mongoose = require('mongoose');
//var config = require('config');
var config = {};
config.db = {};
config.webhost = 'http://localhost:27998/'

config.db.host = 'localhost';
config.db.name = 'shortned_urls';
config.db.port = '27998';


mongoose.connect('mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name);
var _visitorSchema = new mongoose.Schema({
  // _id: {type: text, index: true},
  ip: String,
  url_id: {type: String, index: true}
  visits_count: { type: Number, default: 0 },
  region: String,
  city: String,
  country: String,
  country_name: String,
  continent_code: String,
  postall: String,
  latitude: String,
  longitude: String,
  visit_time: [{ time: Date.now, time_zone: String, utc_offset: String}]
});


var _counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: {type: Number, default: 0 }
});

var _visitCounter = new mongoose.Schema({
  url_id: {type: String, index: true}
});

var _urlSchema = new mongoose.Schema({
  // _id: {type: String, index: true},
  hash: { type: Number, default: 0 },
  original_url: String,
  generated_url: String,
  custom_url: String,
  created_at: { type: Date, default: Date.now },
  platform: String,
  visits_key: String,
  nick_name: String,
  link_name: String
});


var _Counter = mongoose.model('counter', _counterSchema);
var _Url = mongoose.model('url', _urlSchema);
var _visitor = mongoose.model('url', _visitorSchema);

module.exports = {
  Counter: _Counter,
  Url : _Url,
  visitor: _visitor,
  counterSchema: _counterSchema,
  urlSchema: _urlSchema
}
































//
