var express =require('express');
var path =require('path'); //path module in node
var bodyParser = require('body-parser')
var fileUpload = require('express-fileupload');
var routes = require('./routes');
// var io = require('socket.io')();
// var WebSocketServer = require("ws").Server
// var http = require("http")

var app = express();
// var server=require('http').Server(app)
// var io=require('socket.io')(server)

// var resultingClassification = ""

// io.on('connection', function (socket) {
//   console.log('socket connected');
//   socket.on("update", function() {
//     console.log('HEARD FROM THE FRONT ENDDDDDDDDDDDDDDDDDD', resultingClassification)
//     if (resultingClassification !== "") {
//       socket.emit('classification', resultingClassification)
//     }
//   });
// });

app.use(express.static(__dirname+"/"));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use('/', routes);


var server = app.listen(process.env.PORT || 3000, function () {
  console.log('App running on heroku!')
})
// var io = require('socket.io')(server);
// app.set('socketio', io);// next line is the money

// var app = require('express')();
// var server = app.listen(process.env.PORT || 3000);

// var wss = new WebSocketServer({server: server})
// console.log("websocket server created")
//
// wss.on("connection", function(ws) {
//   var id = setInterval(function() {
//     ws.send(JSON.stringify(new Date()), function() {  })
//   }, 1000)
//
//   console.log("websocket connection open")
//
// })
