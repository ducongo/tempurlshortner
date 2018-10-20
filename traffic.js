var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var bases = require('bases');
var config = require('./config');
var model = require('./models/model');

mongoose.connect('mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name);
//https://www.tutorialspoint.com/nodejs/nodejs_request_object.htm
