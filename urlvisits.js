var path = require('path');
// var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var bases = require('bases');
var iplocation = require('iplocation');
var config = require('./config');
var model = require('./models/model');


mongoose.connect('mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name);

var Url = model.Url;
var Visit = model.Visit;

var newVisit = (visit_details) =>{

  var obj = new Visit({
      ip: visit_details.ip,    //visit_details.ip,
      url_id:  visit_details.url_id,
      region: "",
      region_code: "",
      city: "",
      country: "",
      country_name: "",
      continent_code: "",
      postall: "",
      latitude: "",
      longitude: "",
      hostname:visit_details.hostname,
      timezone:"",
      utc_offset:"",
      organization: ""
    });




  // iplocation('134.117.249.81', [],function(err, res){
  //   if(err){
  //     //if there's an error use another ip location library
  //     console.log(err);
  //   }else{
  //     obj.region = res.region;
  //     obj.region_code = ree.region_code;
  //     obj.city = res.city;
  //     obj.country = res.country;
  //     obj.country_name = res.country_name;
  //     obj.continent_code = res.continent_code;
  //     obj.latitude = res.latitude;
  //     obj.longitude = res.longitude;
  //     obj.timezone = res.timezone;
  //     obj.utc_offset = res.utc_offset;
  //     obj.organization = res.org;
  //   }
  //   var newVisit = new Visit(obj);
  // });


   obj.save(function (err) {
      if (err) return console.error(err);
      console.log("-------------------------------------------------------------------");
      console.log("Mew visitor added");
      console.log("------------------------------------------------------------------");
   });

}

module.exports = {
  newVisit: newVisit,
}

















































//
