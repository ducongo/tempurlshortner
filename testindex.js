var express = require('express');
var app = express();
var path = require('path');
const url = require('url');
//var bodyParser = require('body-parser');



app.get('/', function (req, res) {
  console.log("req.baseUrl: " + req.baseUrl);
  console.log("req.body:" + req.body);
  console.log("req.hostname:" + req.hostname);// http:
  console.log("req.ip:" + req.ip);
  console.log("req.ips:" + req.ips);
  console.log("req.originalUrl:" + req.originalUrl);
  console.log("req.path:" + req.path);
  console.log("req.protocol:" + req.protocol);
  console.log("req.subdomains:" + req.subdomains);
  console.log("************************************************");
  //console.log(req);
  console.log("************************************************");
  res.redirect("https://www.youtube.com/")
  for (var i = 0; i < 10; i++) {
    console.log("Iteration: " + i);
  }
});


app.get('/1', function (req, res) {
  var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  console.log("************************************************");
  console.log("User IP" + ip);
  res.redirect("https://www.youtube.com/")
});




app.listen(8080, function () {
  console.log('Listening on port 8080');
  console.log('http://localhost:8080');
});
