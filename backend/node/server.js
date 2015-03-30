var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

/* MongoDB Setup */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test-pp');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('mongoose: Connected to database \'test-pp\'');
});

var pollSchema = mongoose.Schema({
  question: String,
  options: [String],
  author: String,
  time: Date
});

var Poll = mongoose.model('Poll', pollSchema);

app.post('/polls/submit', function (req, res) {
  res.json(req.body); // parse request body, populate req.body object
  console.log(req.body);
  res.end();
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
