var express = require('express');
var app = express();
var fs = require('fs')
var router = express.Router();
var path = require('path');
var bodyParser = require('body-parser')
var PythonShell = require('python-shell');
var fileUpload = require('express-fileupload');
var response = require('response')
var request = require('request')
var http = require('http');
var aws = require('aws-sdk')
var models = require('./models/models.js')
var User = models.User;
var querystring = require('querystring');

// var server = require('http').Server(app)
// var io = require('socket.io')();

var mongoose = require('mongoose')
var resultingClassification = []

var s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


var postToPython = function (data, username) {
  console.log('data', data, 'username', username)

  var postData = querystring.stringify({
    "data" : data,
    "username" : username
  });
  var options = {
    url: 'https://aqueous-retreat-25940.herokuapp.com/classify',
    // url: 'http://sample-env.m359bd53gp.us-west-2.elasticbeanstalk.com/classify',
    // method: 'POST',
    form: postData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  request.post(options, function(e,r,body){
    if(e) {
      console.log(e);
    } else if (r) {
      console.log(r);
    } else {
      console.log(body);
    }
  })

};

router.post('/upload', function (req, res) {
  var tempPath = req.files.photo;
  var targetPath = path.join(__dirname, './uploadedpics');
  console.log('req.files.photo:', req.files.photo);
  targetPath = targetPath + '/pic.jpg'
  console.log('image uploaded, saving to aws')
  var params = {
    Bucket: 'code-testing', Key: 'pics1.jpg', Body: req.files.photo.data, ACL:"public-read-write"
  };
  s3.putObject(params, function(err, data){
    if (err) {
      console.log(err)
    } else {
      var username = 'bcmertz'
      var url = 'https://s3-us-west-1.amazonaws.com/'+'code-testing/'+'pics1.jpg' //can change out later for more robust filepaths
      postToPython(url, username)
      res.send('sent to classifier, processing image');
    }
  })
});

router.post('/results', function (req, res) {
  var data = req.body.source
  var results = data[0]
  var username = req.body.user
  resultingClassification.push({
    results : results,
    username : username
  })
  console.log('recieved', resultingClassification, ', waiting to send results back to the iphone-app')
  // io.on('connection', function(socket){
  // });
  // var io = req.app.get('socketio')
  // io.emit('classification', data[0])
  res.send('got it')
  console.log(1)
})

router.get('/', function(req,res){
  res.render('index.html')
})

router.post('/update', function (req, res) {
  var username = req.body.email;
  resultingClassification.forEach((item)=>{
    if(item.username === username){
      var results = item.results;
      console.log('sending results', results)
      console.log("resultingClassificationBeginning", resultingClassification);
      resultingClassification.splice(item, 1);
      console.log("resultingClassificationEnd", resultingClassification);
      res.send({success : true,
        results : results
      });
    }
  })
  res.send({success:false})
})

router.get('/', function(req,res){
  res.render('index.html')
})


router.post('/register', function(req, res){
  User.findOne({
    email: req.body.email
  }, function(err, user){
    if(err){
      console.log(err);
    } if(user === null){
      var data = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
      }
      var user = User(data)
      user.save(function(err){
        if(err){
          console.log(err)
        } else{
           res.json({
             success: true
           })
        }
      })
    } else{
      res.json({
        success: false,
        error: 'An account with this email has already been created'
      })
    }
  })
})

router.post('/login', function(req, res){
  User.findOne({
    email: req.body.email
  }, function(err, user){
    if(err){
      console.log(err);
    } else if(user === null){
      res.json({
        success: false,
        error: 'This email is not associated with any account'
      })
    } else if(user.password !== req.body.password){
      res.json({
        success: false,
        error: 'Incorrect password'
      })
    } else{
      res.send({
        success: true,
        user: user
      })
    }
  })
})

module.exports = router;
