var http = require('http');
var express = require('express');
var app = express();

var devs = [{name:'Ryan', job:'developer 1'},
            {name:'Tess', job:'developer 2'},
            {name:'Henry', job:'developer 3'}];

app.get('/devs', function (req, res) {
  console.log('GET request for /devs');
  res.send(devs)
});
app.get('/devs/:id', function (req, res) {
  res.send(devs[req.params.id - 1]);
});
app.listen(3000);
console.log('Server running at http://127.0.0.1:3000/');
