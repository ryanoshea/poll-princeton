var http = require('http');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var crypto = require('crypto');
var async = require('async');
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


/* Collections */

var pollSchema = mongoose.Schema({
  question: String,
  choices: [String],
  responses: [Number],
  author: String,
  time: Date,
  pid: String,
  upvotes: Number,
  downvotes: Number,
  score: Number
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

var responseSchema = mongoose.Schema({
  netid: String,
  pid: String,
  idx: Number //true is up
});

var Response = mongoose.model('Response', responseSchema);

var studentSchema = mongoose.Schema({
  first: String,
  last: String,
  netid: String,
  'class': String,
  home: String,
  major: String,
  dorm: String,
  rescol: String
});

var Student = mongoose.model('Student', studentSchema);


/* REST Handlers */

app.post('/polls/submit', function (req, res) {
  console.log('POST request for /polls/submit/');

  //res.json(req.body); // parse request body, populate req.body object
  console.log(req.body);
  var newPoll = {};
  newPoll.question = req.body.question;
  newPoll.choices = req.body.choices;
  newPoll.responses = [];
  for (var i in newPoll.choices)
    newPoll.responses.push(0);
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
    /*console.log(typeof polls);
    console.log(polls[1]);
    console.log(polls[0]);*/
    res.send(polls);
  });
});

app.get('/polls/get/:sortType/:netid/:num/:onlyUser', function(req, res) {
  console.log('GET request for /polls/' + req.params.sortType + '/' + req.params.netid + '/' + req.params.num);
  var user = req.params.netid;
  var current = req.params.num;
  var onlyUser = req.params.onlyUser;
  var sortBy;
  var fields;
  if (req.params.sortType == 'popular')
    sortBy = {'score': -1};
  else if (req.params.sortType == 'newest')
    sortBy = {time: -1};

  if (req.params.onlyUser == 'true')
    fields = {'author': user};
  else if (req.params.onlyUser == 'false') 
    fields = {};

  Poll.find(fields).sort(sortBy).skip(current).limit(10).exec(function (err, polls) {
    var ret = [];
    async.eachSeries(polls, function(p, callback) {
      //console.log("date at start of loop: " + p.time);
      var pid = p.pid;
      var userVote;
      var userResponse;
      Vote.findOne({'pid' : pid, 'netid' : user}, function (err, vote) {
        //console.log(vote);
        if (vote != null) {
          //console.log('test');
          userVote = vote.upOrDown;
        }
        else {
          userVote = null;
        }
        Response.findOne({pid: pid, netid: user}, function (err, response) {
          if (err) console.log('Error.');
          if (response == null)
            userResponse = -1;
          else
            userResponse = response.idx;
          var newPollData = {
            pollData: p,
            userVote: userVote,
            userResponse: userResponse
          };
          //console.log("time added into ret: " + newPollData.pollData.time);
          ret.push(newPollData);
          //console.log(ret.length);
          callback();
        })
      });
    }, function(err) {
      if (err) console.log('Error.');
      else {
        //console.log(polls.length + " " + ret.length);
        res.send(ret);
      }
    });
  });
});

app.get('/polls/get/:pid/:netid', function(req, res) {
  console.log('GET request for /polls/get/' + req.params.pid + '/' + req.params.netid);
  Poll.findOne({'pid' : req.params.pid}, 'question choices responses time pid score', function (err, poll) {
    if (err) console.log('Error.');
    if (poll == null) res.send({'err': true, 'question': 'This poll does not exist.'});
    else {

      var ret = {};
      ret.question = poll.question;
      ret.choices = poll.choices;
      ret.responses = poll.responses;
      ret.time = poll.time;
      ret.pid = poll.pid;
      ret.score = poll.score;

      Vote.findOne({'pid' : req.params.pid, 'netid' : req.params.netid}, function (err, vote) {
        //console.log(vote);
        if (vote != null) {
          console.log('test');
          ret.userVote = vote.upOrDown;
        }
        else {
          ret.userVote = null;
        }

        Response.findOne({pid: req.params.pid, netid: req.params.netid}, function (err, response) {
          if (err) console.log('Error.');
          if (response == null)
            ret.userResponse = -1;
          else
            ret.userResponse = response.idx;

          console.log(ret);
          res.send(ret);
        })
      });
    }
  });
});

// This + the get function above. Authentication?
app.get('/polls/get/:netid', function(req, res) {
  var user = req.params.netid;
  console.log('GET request for /polls/get/' + user);
  Poll.find({"author": user}, 'question choices time pid score', function (err, polls) {
    res.send(polls);
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
            ret.responses = updatedPoll.responses;
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

/* Logs a user response to a poll. Returns the updated responses array for the poll. */
app.post('/polls/respond', function (req, res) {
  //res.json(req.body); // parse request body, populate req.body object
  console.log('POST request for /polls/respond');
  console.log('Request contents: ' + req.body);
  var netid = req.body.netid;
  var pid = req.body.pid;
  var idx = req.body.idx;

  if (netid !== null) {
    Response.findOne({'netid': netid, 'pid': pid}, function (err, response) {
        if (err) console.log('Error.');
        else if (response == null) {
          // Create new response object, update poll with new score for the right choice
          console.log('User ' + netid + ' has not responded to poll ' + pid + ' before. Creating new response.');
          var newResp = {};
          newResp.netid = netid;
          newResp.pid = pid;
          newResp.idx = idx;
          var entry = new Response(newResp);
          entry.save(function (err) {
            if (err) {
              console.error(err);
              res.send({err: true});
            }
            else {
              var update = {$inc: {}};
              update.$inc['responses.' + idx] = 1;
              Poll.findOneAndUpdate({pid: pid}, update, function (err, poll) {
                if (err) {
                  console.error(err);
                  res.send({err: true});
                }
                Poll.findOne({pid: pid}, function(err, newPoll) {
                  if (err) {
                    console.error(err);
                    res.send({err: true});
                  }
                  else if (newPoll == null) {
                    res.send({err: true});
                  }
                  else {
                    res.send({responses: newPoll.responses, userResponse: idx});
                  }
                });
              });
            }
          });
        }
        else {
          if (response.idx === idx) {
            // Revoke response
            console.log('User ' + netid + ' unselected their response to ' + pid + '. Revoking response.');
            Response.findOneAndRemove({'netid': netid, 'pid': pid}, function (err, response) {
              if (err) {
                console.error(err);
                res.send({err: true});
              }
              else {
                var update = {$inc: {}};
                update.$inc['responses.' + idx] = -1;
                Poll.findOneAndUpdate({pid: pid}, update, function (err, poll) {
                  if (err) {
                    console.error(err);
                    res.send({err: true});
                  }
                  else {
                    Poll.findOne({pid: pid}, function(err, newPoll) {
                      if (err) {
                        console.error(err);
                        res.send({err: true});
                      }
                      else if (newPoll == null) {
                        res.send({err: true});
                      }
                      else {
                        res.send({responses: newPoll.responses, userResponse: -1});
                      }
                    });
                  }
                });
              }
            });
          }
          else {
            // Update response
            console.log('User ' + netid + ' has changed their response to ' + pid + '. Updating response.');
            var update = {$set: {idx: idx}};
            Response.findOneAndUpdate({pid: pid, netid: netid}, update, function (err, newResponse) {
              if (err) {
                console.error(err);
                res.send({err: true});
              }
              else {
                var update = {$inc: {}};
                update.$inc['responses.' + response.idx] = -1;
                update.$inc['responses.' + idx] = 1;
                Poll.findOneAndUpdate({pid: pid}, update, function (err, newPoll) {
                  if (err) {
                    console.error(err);
                    res.send({err: true});
                  }
                  else {
                    Poll.findOne({pid: pid}, function(err, newPoll) {
                      if (err) {
                        console.error(err);
                        res.send({err: true});
                      }
                      else if (newPoll == null) {
                        res.send({err: true});
                      }
                      else {
                        res.send({responses: newPoll.responses, userResponse: idx});
                      }
                    });
                  }
                });
              }
            });
          }
        }
    });
  }
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
      // Query for user's Full Name
      var fullname = "";
      Student.findOne({'netid': ticket.netid}, function (err, student) {
        if (err) console.log('Student db error');
        if (student !== null) {
          fullname = student.first + ' ' + student.last;
        }
        res.send({'loggedin' : true, 'netid' : ticket.netid, 'fullname': fullname});
      });
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

            // Query for user's Full Name
            var fullname = "";
            Student.findOne({'netid': netid}, function (err, student) {
              if (err) console.log('Student db error');
              if (student !== null) {
                fullname = student.first + ' ' + student.last;
              }
              res.send({'loggedin' : true, 'netid' : netid, 'fullname': fullname});
            });
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




app.listen(3000);
console.log('Server running at http://127.0.0.1:3000/');
