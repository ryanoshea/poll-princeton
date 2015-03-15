var http = require('http');
var express = require('express');
var app = express();

/* MongoDB Setup */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test-pp');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('mongoose: Connected to database \'test-pp\'');
});

var devSchema = mongoose.Schema({
  name: String,
  job: String
});

var Dev = mongoose.model('Dev', devSchema);

app.get('/devs/store', function (req, res) {
  console.log('Saving devs to db');
  var devs = [{name:'Ryan', job:'developer'},
            {name:'Tess', job:'developer'},
            {name:'Henry', job:'developer'}];
  var ryan = new Dev(devs[0]);
  var henry = new Dev(devs[1]);
  var tess = new Dev(devs[2]);
  ryan.save(function (err) {
    if (err) return console.error(err);
  });
  henry.save(function (err) {
    if (err) return console.error(err);
  });
  tess.save(function (err) {
    if (err) return console.error(err);
  });
});

app.get('/devs', function (req, res) {
  console.log('GET request for /devs');
  //res.send(devs)
  Dev.find({}, function (err, docs) {
    var devs = [];
    for (var i in docs) {
      devs.push({
        'name' : docs[i].name,
        'job' : docs[i].job,
      });
    }
    res.send(devs);
  });
});

app.get('/devs/:id', function (req, res) {
  res.send(devs[req.params.id - 1]);
});

app.listen(3000);
console.log('Server running at http://127.0.0.1:3000/');
