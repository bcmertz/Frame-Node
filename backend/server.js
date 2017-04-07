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


app.listen(process.env.PORT || 3000, function () {
  console.log('App running on heroku!')
})
