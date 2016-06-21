var express = require('express');
var packageInfo = require('./package.json');

var app = express();

app.get('/', function (req, res) {
  res.json({ version: packageInfo.version });
});

var server = app.listen(8081, function () { // process.env.PORT
  var host = server.address().address;
  var port = server.address().port;

  console.log('Web server started on host: http://', host, port);
});