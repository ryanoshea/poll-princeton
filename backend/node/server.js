var http = require('http');
var https = require('https');
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

var ticketSchema = mongoose.Schema({
  netid: String,
  ticket: String
});

var Ticket = mongoose.model('Ticket', ticketSchema);

app.post('/polls/submit', function (req, res) {
  //res.json(req.body); // parse request body, populate req.body object
  console.log(req.body);
  var newPoll = {};
  newPoll.question = req.body.question;
  newPoll.choices = req.body.choices;
  newPoll.author = req.body.author;
  var sha256 = crypto.createHash('sha256');
  sha256.update(newPoll.question + newPoll.author);
  newPoll.pid = sha256.digest('hex');
  newPoll.time = new Date();
  var question = new Poll(newPoll);
  question.save(function (err) {
    if (err) return console.error(err);
  });
  res.send({'pid' : newPoll.pid});
});

app.get('/polls/get/all', function (req, res) {
  console.log('GET request for /polls/get/all');
  Poll.find({}, 'question choices time pid', function (err, polls) {
    res.send(polls);
  });
});

app.get('/polls/get/:pid', function(req, res) {
  console.log('GET request for /polls/get/' + req.params.pid);
  Poll.findOne({'pid' : req.params.pid}, 'question choices time pid', function (err, poll) {
    if (err) console.log('Error.');
    if (poll == null) res.send({'err': true, 'question': 'This poll does not exist.'});
    else res.send(poll);
  });
});

app.get('/polls/delete/all', function (req, res) {
  console.log('GET request for /polls/delete/all');
  Poll.find({}).remove().exec();
  res.end();
});


// Indicates whether the provided CAS ticket (for just-after-login) or ticket/netid pair (for return
// visits) are valid, and thus the user is logged in. Returns {loggedin : true/false}.
app.post('/auth/loggedin', function (req, res) {
  console.log('POST request for /auth/loggedin');

  // Check for the ticket in the db of currently-logged-in tickets/users
  var foundInDB = false;
  var sentTicket = {ticket: req.body.ticket, netid: req.body.netid};
  Ticket.findOne({ticket: sentTicket.ticket}, function (err, ticket) {

    if (ticket != null) {
      // The user is already logged in
      console.log("Found user " + ticket.netid + " in database. Authenticated.");
      foundInDB = true;
      res.send({loggedin: true, netid: ticket.netid});
    }
    else {
      // User not found in db; check with CAS's validation server
      console.log("Could not find user " + sentTicket.netid + " in database.");
      var casValidateUrl = 'https://fed.princeton.edu/cas/validate?ticket=' + req.body.ticket + '&service=' + req.body.returnUrl;
      console.log('Querying ' + casValidateUrl);
      var response = "";
      https.get(casValidateUrl, function(resp) {
        resp.on('data', function(d) {
          // Piece chunks of response together
          response = response + d;
        });
        resp.on('end', function(d) {
          // Response is ready, continue
          console.log('Response from CAS: ' + response);
          if (response.charAt(0) == 'y') {
            // CAS approved the ticket
            var netid = response.substring(response.indexOf('\n') + 1, response.length - 1);
            var newTicket = {ticket: req.body.ticket, netid: netid};
            console.log(newTicket);
            var saveTicket = new Ticket(newTicket);
            saveTicket.save(function (err) {
              if (err)
                console.log("Database ticket save error.");
            });
            res.send({'loggedin' : true, 'netid' : netid});
          }
          else {
            // CAS rejected the ticket
            res.send({'loggedin' : false});
          }
        });
        resp.on('error', function(e) {
          res.send({'loggedin' : false}); // just to be safe
        });
      });
    }
  });
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
