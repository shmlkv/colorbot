var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public' + '/index.html');
});

app.get('*', function(req, res){
  res.redirect('/');
});

app.listen(process.env.PORT || 3322, function(){
  console.log('App is runned on port ' +  1233 || process.env.PORT);
});

module.exports = app;