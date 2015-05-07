var http = require('http');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var crypto = require('crypto');
var async = require('async');
var fs = require('fs');
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
  demographics: {
    ab: [Number],
    bse: [Number],
    class2015: [Number],
    class2016: [Number],
    class2017: [Number],
    class2018: [Number],
    class2019: [Number],
    rocky: [Number],
    mathey: [Number],
    butler: [Number],
    wilson: [Number],
    whitman: [Number],
    forbes: [Number]
  },
  author: String,
  time: Date,
  pid: String,
  upvotes: Number,
  downvotes: Number,
  score: Number,
  reports: Number,
});

var Poll = mongoose.model('Poll', pollSchema);

var ticketSchema = mongoose.Schema({
  netid: String,
  ticket: String
});

var Ticket = mongoose.model('Ticket', ticketSchema);

var userLogSchema = mongoose.Schema({
  netid: String,
  time: Date
});

var userLog = mongoose.model('userLog', userLogSchema);

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

var reportSchema = mongoose.Schema({
  netid: String,
  pid: String
})

var Report = mongoose.model('Report', reportSchema);

var karmaSchema = mongoose.Schema({
  netid: String,
  score: Number
})

var Karma = mongoose.model('Karma', karmaSchema);

/* REST Handlers */

app.post('/polls/submit', function (req, res) {
  console.log('POST request for /polls/submit/');
  var user = req.body.author;
  var ticket  = req.body.ticket;
  Ticket.findOne({netid: user, ticket: ticket}, function (err, ticket) {
    if (err) {
      console.log('Database error.');
      res.status(500).send({msg: 'Database error.'});
    }
    if (ticket == null) {
      console.log('User ' + user + ' is unauthorized to make this request.');
      res.status(403).send({msg: 'You are unauthorized to make this request.'});
    }
    else {
      console.log('User ' + user + ' is authorized to make this request.');

      var err = false;
      // Validity checking
      if (req.body.question.length > 350) {
        res.status(413).send({err: true, msg: 'You submitted a poll with a question longer than is allowed.'});
        err = true;
      }
      if (req.body.choices.length > 10) {
       res.status(413).send({err: true, msg: 'You submitted a poll with more responses than is allowed.'});
       err = true;
      }
      for (var i in req.body.choices) {
        if (req.body.choices[i].length > 144) {
          res.status(413).send({err: true, msg: 'You submitted a poll with a choice that is longer than is allowed.'});
          err = true;
        }
      }

      if (!err) {
        console.log(req.body);
        var newPoll = {};
        newPoll.question = req.body.question;
        newPoll.choices = req.body.choices;
        newPoll.responses = [];
        newPoll.demographics = {};
        newPoll.demographics.ab = [];
        newPoll.demographics.bse = [];
        newPoll.demographics.class2015 = [];
        newPoll.demographics.class2016 = [];
        newPoll.demographics.class2017 = [];
        newPoll.demographics.class2018 = [];
        newPoll.demographics.class2019 = [];
        newPoll.demographics.rocky = [];
        newPoll.demographics.mathey = [];
        newPoll.demographics.butler = [];
        newPoll.demographics.wilson = [];
        newPoll.demographics.whitman = [];
        newPoll.demographics.forbes = [];
        for (var i in newPoll.choices) {
          newPoll.responses.push(0);
          newPoll.demographics.ab.push(0);
          newPoll.demographics.bse.push(0);
          newPoll.demographics.class2015.push(0);
          newPoll.demographics.class2016.push(0);
          newPoll.demographics.class2017.push(0);
          newPoll.demographics.class2018.push(0);
          newPoll.demographics.class2019.push(0);
          newPoll.demographics.rocky.push(0);
          newPoll.demographics.mathey.push(0);
          newPoll.demographics.butler.push(0);
          newPoll.demographics.wilson.push(0);
          newPoll.demographics.whitman.push(0);
          newPoll.demographics.forbes.push(0);
        }
        newPoll.author = req.body.author;
        newPoll.upvotes = 0;
        newPoll.downvotes = 0;
        newPoll.score = 0;
        newPoll.reports = 0;
        newPoll.reporters = {};
        newPoll.time = new Date();
        var sha256 = crypto.createHash('sha256');
        sha256.update(newPoll.question + newPoll.time);
        newPoll.pid = sha256.digest('hex');
        var question = new Poll(newPoll);
        question.save(function (err) {
          if (err) return console.error(err);
        });
        res.send({'pid' : newPoll.pid});
      }
    }
  });
});

/*
app.get('/polls/get/all', function (req, res) {
  console.log('GET request for /polls/get/all');
  Poll.find({}, 'question choices time pid score', function (err, polls) {
    res.send(polls);
  });
});
*/

//Get 10 polls of either Popular, Best or Newest
app.get('/polls/get/:sortType/:netid/:ticket/:num/:onlyUser', function(req, res) {
  console.log('GET request for /polls/' + req.params.sortType + '/' + req.params.netid + '/' + req.params.ticket + '/' + req.params.num);
  var user = req.params.netid;
  var ticket = req.params.ticket;
  var current = req.params.num;
  var onlyUser = req.params.onlyUser;
  Ticket.findOne({netid: user, ticket: ticket}, function (err, ticket) {
    if (err) {
      console.log('Database error.');
      res.status(500).send({msg: 'Database error.'});
    }
    if (ticket == null) {
      console.log('User ' + user + ' is unauthorized to make this request.');
      res.status(403).send({msg: 'You are unauthorized to make this request.'});
    }
    else {
      console.log('User ' + user + ' is authorized to make this request.');
      var sortBy;
      var fields = {};
      if (onlyUser == 'false') fields.reports = {$lt: 3}; //1 for testing. 3 for deployment
      if (req.params.sortType == 'popular' || req.params.sortType == 'best')
        sortBy = {'score': -1};
      else if (req.params.sortType == 'newest')
        sortBy = {time: -1};

      if (req.params.onlyUser == 'true') {
        fields.author = user;
      }
      fields.score = {$gt: -5}; // Filter out unpopular polls
      if (req.params.sortType == 'popular') {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        fields.time = {$gt: yesterday};
      }

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
                userResponse: userResponse,
                isAuthor: p.author == user
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
            if (ret.length === 0) {
              res.send({err: true});
            }
            else
              res.send(ret);
          }
        });
      });
    }
  });
});

//Get one poll in particular
app.get('/polls/get/:pid/:netid/:ticket', function(req, res) {
  console.log('GET request for /polls/get/' + req.params.pid + '/' + req.params.netid + '/' + req.params.ticket);
  var user = req.params.netid;
  var ticket = req.params.ticket;
  Ticket.findOne({netid: user, ticket: ticket}, function (err, ticket) {
    if (err) {
      console.log('Database error.');
      res.status(500).send({msg: 'Database error.'});
    }
    if (ticket == null) {
      console.log('User ' + user + ' is unauthorized to make this request.');
      res.status(403).send({msg: 'You are unauthorized to make this request.'});
    }
    else {
      console.log('User ' + user + ' is authorized to make this request.');
      Poll.findOne({'pid' : req.params.pid}, 'question choices responses demographics time pid score author', function (err, poll) {
        if (err) console.log('Error.');
        if (poll == null) res.send({'err': true, 'question': 'This poll does not exist.'});
        else {
          var ret = {};
          ret.question = poll.question;
          ret.choices = poll.choices;
          ret.responses = poll.responses;
          ret.demographics = poll.demographics;
          ret.time = poll.time;
          ret.pid = poll.pid;
          ret.score = poll.score;
          ret.isAuthor = poll.author === req.params.netid;

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
    }
  });
});

//Get all polls for one user
//Should be obsolete?
app.get('/polls/get/:netid/:ticket', function(req, res) {
  console.log('GET request for /polls/get/' + user + '/' + req.params.ticket);
  var user = req.params.netid;
  var ticket = req.params.ticket;
  Ticket.findOne({netid: user, ticket: ticket}, function (err, ticket) {
    if (err) {
      console.log('Database error.');
      res.status(500).send({msg: 'Database error.'});
    }
    if (ticket == null) {
      console.log('User ' + user + ' is unauthorized to make this request.');
      res.status(403).send({msg: 'You are unauthorized to make this request.'});
    }
    else {
      console.log('User ' + user + ' is authorized to make this request.');
      Poll.find({"author": user}, 'question choices time pid score', function (err, polls) {
        res.send(polls);
      });
    }
  });
});

app.delete('/polls/delete/:pid/:netid/:ticket', function(req, res) {
  console.log('DELETE request for poll: ' + req.params.pid + ' by user: ' + req.params.netid + ' with ticket ' + req.params.ticket);
  var pid = req.params.pid;
  var netid = req.params.netid;
  var ticket = req.params.ticket;
  var user = netid;
  Ticket.findOne({netid: user, ticket: ticket}, function (err, ticket) {
    if (err) {
      console.log('Database error.');
      res.status(500).send({msg: 'Database error.'});
    }
    if (ticket == null) {
      console.log('User ' + user + ' is unauthorized to make this request.');
      res.status(403).send({msg: 'You are unauthorized to make this request.'});
    }
    else {
      console.log('User ' + user + ' is authorized to make this request.');
      Poll.findOne({pid: pid}, 'author', function (err, poll) {
        if (err) {
          console.log('Database error.');
          res.send({err: true, msg: 'Database error.'});
          return;
        }
        else if (poll == null) {
          console.log('Poll not found.');
          res.send({err: true, msg: 'No poll with that ID found.'});
          return;
        }
        else if (poll.author !== netid && netid !== 'roshea' && netid !== 'marchant' && netid != 'hzlu') {
          console.log('Non-author, non-admin tried to delete poll. Cancelling.');
          res.send({err: true, msg: 'You are not the author of the given poll, so you can\'t delete it.'});
          return;
        }
        else {
          Poll.findOneAndRemove({pid: pid}, function (err, poll) {
            Response.remove({pid: pid}, function (err) {
              Vote.remove({pid: pid}, function (err) {
                res.send({err: false});
              });
            });
          });
        }
      });
    }
  });
});

/*
app.get('/polls/delete/all', function (req, res) {
  console.log('GET request for /polls/delete/all');
  Poll.find({}).remove().exec();
  Vote.find({}).remove().exec();
  res.end();
});
*/

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
  var user = netid;
  var ticket = req.body.ticket;
  Ticket.findOne({netid: user, ticket: ticket}, function (err, ticket) {
    if (err) {
      console.log('Database error.');
      res.status(500).send({msg: 'Database error.'});
    }
    if (ticket == null) {
      console.log('User ' + user + ' is unauthorized to make this request.');
      res.status(403).send({msg: 'You are unauthorized to make this request.'});
    }
    else {
      console.log('User ' + user + ' is authorized to make this request.');
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
          var VoterConditions = {netid: user};
          var update;
          var updateVoterKarma;
          var updateAuthorKarma;
          console.log("negated " + negated);

          // This clusterfuck
          if (upOrDown) {
            if (reversed) {
              update = {$inc: {upvotes:1, downvotes: -1, score:2}};
              updateVoterKarma = {$inc: {score:1}};
              updateAuthorKarma = {$inc: {score:2}};
            }
            else if (negated) {
              update = {$inc: {upvotes:-1, score:-1}};
              updateVoterKarma = {$inc: {score:-1}};
              updateAuthorKarma = {$inc: {score:-1}};
            }
            else {
              update = {$inc: {upvotes:1, score:1}};
              updateVoterKarma = {$inc: {score:1}};
              updateAuthorKarma = {$inc: {score:1}};
            }
          }
          else {
            if (reversed) {
              update = {$inc: {downvotes:1, upvotes: -1, score:-2}};
              updateVoterKarma = {$inc: {score:-1}};
              updateAuthorKarma = {$inc: {score:-2}};
            }
            else if (negated) {
              update = {$inc: {downvotes:-1, score:1}};
              updateVoterKarma = {};
              updateAuthorKarma = {$inc: {score:1}};
            }
            else {
              update = {$inc: {downvotes:1, score:-1}};
              updateVoterKarma = {};
              updateAuthorKarma = {$inc: {score:-1}};
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
              var author = updatedPoll.author;
              var AuthorConditions = {netid: author};
              Karma.findOneAndUpdate(VoterConditions, updateVoterKarma, options, function(err, updatedVoterKarma) {
                if (err) console.log('Voter score update error');
                else {
                  Karma.findOneAndUpdate(AuthorConditions, updateAuthorKarma, options, function(err, updatedAuthorKarma) {
                    if (err) console.log('Voter score update error');
                    if (author == netid) {
                      ret.userKarma = updatedAuthorKarma.score;
                    }
                    else {
                      ret.userKarma = updatedVoterKarma.score;
                    }
                    res.send(ret);
                  });
                }
              });
            }
          });
        });
      }
      else {
        res.send({'err': true, 'netid': 'You are not logged in.'});
      }
    }
  });
});

/* Logs a user response to a poll. Returns the updated responses array for the poll. */
app.post('/polls/respond', function (req, res) {
  //res.json(req.body); // parse request body, populate req.body object
  console.log('POST request for /polls/respond');
  console.log('Request contents: ' + req.body);
  var netid = req.body.netid;
  var pid = req.body.pid;
  var idx = req.body.idx;
  var user = netid;
  var ticket = req.body.ticket;
  Student.findOne({netid: user}, function (err, student){
    if (err) {
      res.status(500).send({err: true, msg: 'Database error.'});
    }
    else {
      Ticket.findOne({netid: user, ticket: ticket}, function (err, ticket) {
        if (err) {
          console.log('Database error.');
          res.status(500).send({msg: 'Database error.'});
        }
        if (ticket == null) {
          console.log('User ' + user + ' is unauthorized to make this request.');
          res.status(403).send({msg: 'You are unauthorized to make this request.'});
        }
        else {
          console.log('User ' + user + ' is authorized to make this request.');
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
                    res.status(500).send({err: true, msg: 'Database error.'});
                  }
                  else {
                    var update = {$inc: {}};
                    update.$inc['responses.' + idx] = 1;
                    if (student != null) {
                      var delta = 1;
                      var AB = student.major.charAt(0) != 'B';
                      if (AB) { // Student is an AB major
                        update.$inc['demographics.ab.' + idx] = delta;
                      }
                      else {
                        update.$inc['demographics.bse.' + idx] = delta;
                      }
                      switch (student.class) {
                        case '2015':
                          update.$inc['demographics.class2015.' + idx] = delta;
                          break;
                        case '2016':
                          update.$inc['demographics.class2016.' + idx] = delta;
                          break;
                        case '2017':
                          update.$inc['demographics.class2017.' + idx] = delta;
                          break;
                        case '2018':
                          update.$inc['demographics.class2018.' + idx] = delta;
                          break;
                        case '2019':
                          update.$inc['demographics.class2019.' + idx] = delta;
                          break;
                        default:
                          break;
                      }
                      switch (student.rescol) {
                        case 'Mathey':
                          update.$inc['demographics.mathey.' + idx] = delta;
                          break;
                        case 'Rockefeller':
                          update.$inc['demographics.rocky.' + idx] = delta;
                          break;
                        case 'Whitman':
                          update.$inc['demographics.whitman.' + idx] = delta;
                          break;
                        case 'Forbes':
                          update.$inc['demographics.forbes.' + idx] = delta;
                          break;
                        case 'Butler':
                          update.$inc['demographics.butler.' + idx] = delta;
                          break;
                        case 'Wilson':
                          update.$inc['demographics.wilson.' + idx] = delta;
                          break;
                      }
                    }
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
                          res.send({responses: newPoll.responses, userResponse: idx, demographics: newPoll.demographics});
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
                      if (student != null) {
                        var delta = -1;
                        var AB = student.major.charAt(0) != 'B';
                        if (AB) { // Student is an AB major
                          update.$inc['demographics.ab.' + idx] = delta;
                        }
                        else {
                          update.$inc['demographics.bse.' + idx] = delta;
                        }
                        switch (student.class) {
                          case '2015':
                            update.$inc['demographics.class2015.' + idx] = delta;
                            break;
                          case '2016':
                            update.$inc['demographics.class2016.' + idx] = delta;
                            break;
                          case '2017':
                            update.$inc['demographics.class2017.' + idx] = delta;
                            break;
                          case '2018':
                            update.$inc['demographics.class2018.' + idx] = delta;
                            break;
                          case '2019':
                            update.$inc['demographics.class2019.' + idx] = delta;
                            break;
                          default:
                            break;
                        }
                        switch (student.rescol) {
                          case 'Mathey':
                            update.$inc['demographics.mathey.' + idx] = delta;
                            break;
                          case 'Rockefeller':
                            update.$inc['demographics.rocky.' + idx] = delta;
                            break;
                          case 'Whitman':
                            update.$inc['demographics.whitman.' + idx] = delta;
                            break;
                          case 'Forbes':
                            update.$inc['demographics.forbes.' + idx] = delta;
                            break;
                          case 'Butler':
                            update.$inc['demographics.butler.' + idx] = delta;
                            break;
                          case 'Wilson':
                            update.$inc['demographics.wilson.' + idx] = delta;
                            break;
                        }
                      }
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
                              res.send({responses: newPoll.responses, userResponse: -1, demographics: newPoll.demographics});
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
                      if (student != null) {
                        var AB = student.major.charAt(0) != 'B';
                        if (AB) { // Student is an AB major
                          update.$inc['demographics.ab.' + idx] = 1;
                          update.$inc['demographics.ab.' + response.idx] = -1;
                        }
                        else {
                          update.$inc['demographics.bse.' + idx] = 1;
                          update.$inc['demographics.bse.' + response.idx] = -1;
                        }
                        switch (student.class) {
                          case '2015':
                            update.$inc['demographics.class2015.' + idx] = 1;
                            update.$inc['demographics.class2015.' + response.idx] = -1;
                            break;
                          case '2016':
                            update.$inc['demographics.class2016.' + idx] = 1;
                            update.$inc['demographics.class2016.' + response.idx] = -1;
                            break;
                          case '2017':
                            update.$inc['demographics.class2017.' + idx] = 1;
                            update.$inc['demographics.class2017.' + response.idx] = -1;
                            break;
                          case '2018':
                            update.$inc['demographics.class2018.' + idx] = 1;
                            update.$inc['demographics.class2018.' + response.idx] = -1;
                            break;
                          case '2019':
                            update.$inc['demographics.class2019.' + idx] = 1;
                            update.$inc['demographics.class2019.' + response.idx] = -1;
                            break;
                          default:
                            break;
                        }
                        switch (student.rescol) {
                          case 'Mathey':
                            update.$inc['demographics.mathey.' + idx] = 1;
                            update.$inc['demographics.mathey.' + response.idx] = -1;
                            break;
                          case 'Rockefeller':
                            update.$inc['demographics.rocky.' + idx] = 1;
                            update.$inc['demographics.rocky.' + response.idx] = -1;
                            break;
                          case 'Whitman':
                            update.$inc['demographics.whitman.' + idx] = 1;
                            update.$inc['demographics.whitman.' + response.idx] = -1;
                            break;
                          case 'Forbes':
                            update.$inc['demographics.forbes.' + idx] = 1;
                            update.$inc['demographics.forbes.' + response.idx] = -1;
                            break;
                          case 'Butler':
                            update.$inc['demographics.butler.' + idx] = 1;
                            update.$inc['demographics.butler.' + response.idx] = -1;
                            break;
                          case 'Wilson':
                            update.$inc['demographics.wilson.' + idx] = 1;
                            update.$inc['demographics.wilson.' + response.idx] = -1;
                            break;
                        }
                      }
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
                              res.send({responses: newPoll.responses, userResponse: idx, demographics: newPoll.demographics});
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
        }
      });
    }
  });
});


//Report function
app.post('/polls/report', function (req, res) {
  var pollID = req.body.pollID;
  var user = req.body.author;
  var ticket = req.body.ticket;
  console.log('POST request for /polls/report/' + pollID + '/' + user);
  Ticket.findOne({netid: user, ticket: ticket}, function (err, ticket) {
    if (err) {
      console.log('Database error.');
      res.status(500).send({msg: 'Database error.'});
    }
    if (ticket == null) {
      console.log('User ' + user + ' is unauthorized to make this request.');
      res.status(403).send({msg: 'You are unauthorized to make this request.'});
    }
    else {
      console.log('User ' + user + ' is authorized to make this request.');
      if (user !== null) {
        Report.findOne({netid: user, pid: pollID}, function(err, reported) {
          if (reported == null) {
            var conditions = {pid: pollID};
            var update = {$inc: {reports:1}};
            var options = {new: true};
            Poll.findOneAndUpdate(conditions, update, options, function (err, updatedPoll) {
                if (err) console.log('Error.');
                else {
                  console.log('Reported: ' + updatedPoll);
                  var report = {};
                  report.pid = pollID;
                  report.netid = user;
                  var newReport = new Report(report);
                  newReport.save(function(err) {
                    if (err) return console.error(err);
                  });
                  res.send({'success': true});
                }
            });
          }
          else res.send({'success': false});
        });
      }
      else {
        res.status(403).send({'err': true, 'msg': 'You are not logged in.'});
      }
    }
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
      // Query for user's Full Name
      var fullname = "";

      //Logging visitors
      var newLogDate = new Date();
      var log = ticket.netid + " " + newLogDate + '\n';
      var newUserLog = {netid: ticket.netid, time: newLogDate};
      var saveLog = new userLog(newUserLog);
      userLog.findOne({netid: ticket.netid}, function(err, result) {
        if (result == null) {
          saveLog.save(function (err) {
          console.log("saving unique user");
          if (err)
            console.log("Database log save error.");
          });
        }
      });
      fs.appendFile('userLog.txt', log, function (err)
      {
        if (err) console.log('Logging error');
      });

      Student.findOne({'netid': ticket.netid}, function (err, student) {
        if (err) console.log('Student db error');
        if (student !== null) {
          var fullname = student.first + ' ' + student.last;
        }
        else {
          var fullname = ticket.netid;
        }
        Karma.findOne({'netid': ticket.netid}, function(err, userKarma) {
          if (err) console.log('Karma db error');
          if (userKarma == null) {
            var newKarma = {};
            newKarma.score = 1;
            newKarma.netid = ticket.netid;
            var karma = new Karma(newKarma);
            karma.save(function (err) {
              if (err) return console.error(err);
            });
            res.send({'loggedin' : true, 'netid' : ticket.netid, 'fullname': fullname, 'karma': 1});
          }
          else {
            var pollKarma = userKarma.score;
            console.log('current karma is' + pollKarma);
            res.send({'loggedin' : true, 'netid' : ticket.netid, 'fullname': fullname, 'karma': pollKarma});
          }
        });
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

            //Logging visitors
            var newLogDate = new Date();
            var log = netid + " " + newLogDate + '\n';
            var newUserLog = {netid: netid, time: newLogDate};
            var saveLog = new userLog(newUserLog);
            userLog.findOne({netid: netid}, function(err, result) {
              if (result == null) {
                saveLog.save(function (err) {
                if (err)
                  console.log("Database log save error.");
                });
              }
            });
            fs.appendFile('userLog.txt', log, function (err)
            {
              if (err) console.log('Logging error');
            });

            //Save ticket
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
              Karma.findOne({'netid': netid}, function(err, userKarma) {
                if (err) console.log('Karma db error');
                if (userKarma == null) {
                  var newKarma = {};
                  newKarma.score = 1;
                  newKarma.netid = netid;
                  var karma = new Karma(newKarma);
                  karma.save(function (err) {
                    if (err) return console.error(err);
                  });
                  res.send({'loggedin' : true, 'netid' : netid, 'fullname': fullname, 'karma': 1});
                }
                else {
                  var pollKarma = userKarma.score;
                  res.send({'loggedin' : true, 'netid' : netid, 'fullname': fullname, 'karma': pollKarma});
                }
              });
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
