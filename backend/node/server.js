var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var crypto = require('crypto');
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
  choices: [String],
  author: String,
  time: Date,
  pid: String
});

var Poll = mongoose.model('Poll', pollSchema);

app.post('/polls/submit', function (req, res) {
  res.json(req.body); // parse request body, populate req.body object
  console.log(req.body);
  var newPoll = req.body;
  var sha256 = crypto.createHash('sha256');
  sha256.update(newPoll.question + newPoll.author);
  newPoll.pid = sha256.digest('base64');
  newPoll.time = new Date();
  var question = new Poll(newPoll);
  question.save(function (err) {
    if (err) return console.error(err);
  });
  res.end();
});

app.get('/polls/get/all', function (req, res) {
  console.log('GET request for /polls/get/all');
  Poll.find({}, function (err, docs) {
    var polls = [];
    for (var i in docs) {
      polls.push({
        'question': docs[i].question,
        'choices': docs[i].choices,
        'time': docs[i].time,
        'pid': docs[i].pid
      });
    }
    res.send(polls);
  });
});

app.get('/polls/delete/all', function (req, res) {
  console.log('GET request for /polls/delete/all');
  Poll.find({}).remove().exec();
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
