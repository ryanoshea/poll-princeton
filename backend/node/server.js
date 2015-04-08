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
  pid: String,
  upvotes: Number,
  downvotes: Number,
  score: Number,
  responders: [String]
});

var Poll = mongoose.model('Poll', pollSchema);

var ticketSchema = mongoose.Schema({
  netid: String,
  ticket: String
});

var Ticket = mongoose.model('Ticket', ticketSchema);

var voteSchema = mongoose.Schema({
  netid: String,
  pid: String,
  upOrDown: Boolean //true is up
});

var Vote = mongoose.model('Vote', voteSchema);

app.post('/polls/submit', function (req, res) {
  console.log('POST request for /polls/submit/');

  //res.json(req.body); // parse request body, populate req.body object
  console.log(req.body);
  var newPoll = {};
  newPoll.question = req.body.question;
  newPoll.choices = req.body.choices;
  newPoll.author = req.body.author;
  newPoll.upvotes = 0;
  newPoll.downvotes = 0;
  newPoll.score = 0;

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
  Poll.find({}, 'question choices time pid score', function (err, polls) {
    res.send(polls);
  });
});

app.get('/polls/get/:pid/:netid', function(req, res) {
  console.log('GET request for /polls/get/' + req.params.pid + '/' + req.params.netid);
  Poll.findOne({'pid' : req.params.pid}, 'question choices time pid score', function (err, poll) {
    if (err) console.log('Error.');
    if (poll == null) res.send({'err': true, 'question': 'This poll does not exist.'});
    else {

      var ret = {};
      ret.question = poll.question;
      ret.choices = poll.choices;
      ret.time = poll.time;
      ret.pid = poll.pid;
      ret.score = poll.score;

      Vote.findOne({'pid' : req.params.pid, 'netid' : req.params.netid}, function (err, vote) {
        console.log(vote);
        if (vote != null) {
          console.log('test');
          ret.userVote = vote.upOrDown;
        }
        else {
          ret.userVote = null;
        }
        console.log(ret);
        res.send(ret);
      });
    }
  });
});

app.get('/polls/delete/all', function (req, res) {
  console.log('GET request for /polls/delete/all');
  Poll.find({}).remove().exec();
  Vote.find({}).remove().exec();
  res.end();
});

// Plus send pid.
app.post('/polls/vote', function (req, res) {
  console.log('POST request for /polls/vote');
  //res.json(req.body); // parse request body, populate req.body object
  console.log(req.body);
  upOrDown = req.body.upOrDown; // up is true
  pollID = req.body.pollID;
  netid = req.body.netid;
  var reversed = false;
  var negated = false;

  if (netid !== null) {
    Vote.findOne({'pid' : pollID, 'netid' : netid}, 'upOrDown', function (err, oldVote) {
      if (err) console.log('Error with vote db.');
      if (oldVote) {
        var oldUpOrDown = oldVote.upOrDown;
        console.log("new " + upOrDown);
        console.log("old " + oldUpOrDown);
        if (upOrDown == oldUpOrDown) {
          console.log("removing " + pollID + " " + netid);
          var conditions = {pid: pollID, netid: netid};
          Vote.findOneAndRemove(conditions, function (err, results) {
            console.log("remove results: " + results);   //** These two not guaranteed to execute in order
          });    //if already voted button pressed again
          negated = true;
        }
        else {
          var conditions = {pid: pollID, netid: netid};
          var update = {upOrDown: upOrDown};
          Vote.findOneAndUpdate(conditions, update, function (err, results) {
            console.log("updated results: " + results); //** Need to be made sync?
          }); //if other button pressed
          reversed = true;
        }
      }
      else {
        var newVoteFields = {};
        newVoteFields.netid = netid;
        newVoteFields.upOrDown = upOrDown;
        newVoteFields.pid = pollID;
        var newVote = new Vote(newVoteFields);
        newVote.save(function (err) {
        if (err) return console.error(err);   //if no button pressed yet
        });
      }
      var conditions = {pid: pollID};
      var update;
      console.log("negated " + negated);

      // This clusterfuck
      if (upOrDown) {
        if (reversed) {
          update = {$inc: {upvotes:1, downvotes: -1, score:2}};
        }
        else if (negated) {
          update = {$inc: {upvotes:-1, score:-1}};
        }
        else {
          update = {$inc: {upvotes:1, score:1}};
        }
      }
      else {
        if (reversed) {
          update = {$inc: {downvotes:1, upvotes: -1, score:-2}};
        }
        else if (negated) {
          update = {$inc: {downvotes:-1, score:1}};
        }
        else {
          update = {$inc: {downvotes:1, score:-1}};
        }
      }
      var options = {new: true};
      Poll.findOneAndUpdate(conditions, update, options, function (err, updatedPoll) {
          console.log('New score: ' + updatedPoll);
          if (err) console.log('Error.');
          if (updatedPoll == null) res.send({'err': true, 'question': 'This poll does not exist.'});
          else {
            var ret = {};
            ret.question = updatedPoll.question;
            ret.score = updatedPoll.score;
            ret.choices = updatedPoll.choices;
            ret.pid = updatedPoll.pid;
            if (negated)
              ret.userVote = null;
            else {
              ret.userVote = upOrDown;
            }
            res.send(ret);
          }
      });
    });
  }
  else {
    res.send({'err': true, 'netid': 'You are not logged in.'});
  }

});




app.post('/polls/respond', function (req, res) {
  //res.json(req.body); // parse request body, populate req.body object
  console.log(req.body);
  pollID = req.body.pollID;
  var conditions = {pid: pollID};
  var update = {$inc: {score:1}, };
  Poll.findOneAndUpdate(conditions, update, function (err, updatedPoll) {
      if (err) console.log('Error.');
      if (updatedPoll == null) res.send({'err': true, 'question': 'This poll does not exist.'});
      else res.send(updatedPoll);
  });
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
      }).on('error', function(e) {
        console.log("Got error from CAS: " + e.message);
        res.send({'loggedin' : false}); // just to be safe
      });
    }
  });
});

app.get('/auth/logout/:netid', function (req, res) {
  console.log('GET request for /auth/logout/' + req.params.netid);
  Ticket.find({netid: req.params.netid}).remove().exec();
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
