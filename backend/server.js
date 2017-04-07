var express =require('express');
var path =require('path'); //path module in node
var bodyParser = require('body-parser')
var fileUpload = require('express-fileupload');
var routes = require('./routes');

var app = express();



app.use(express.static(__dirname));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use('/', routes);


var server = app.listen(process.env.PORT || 3000, function () {
  console.log('App running on heroku!')
})
var io = require('socket.io')(server);
app.set('classification', io);// next line is the money

// var app = require('express')();
// var server = app.listen(process.env.PORT || 3000);
