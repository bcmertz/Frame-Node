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
  var username = req.body.email;
  var targetPath = path.join(__dirname, './uploadedpics');
  console.log('UUOPPPPPLLLOOOAAADDDD','tempPath, username', tempPath, username)
  targetPath = targetPath + '/pic.jpg'
  console.log('image uploaded, saving to aws')
  var key = username+'.jpg'
  var params = {
    // Bucket: 'code-testing', Key: 'pics1.jpg', Body: req.files.photo.data, ACL:"public-read-write"
    Bucket: 'code-testing', Key: key, Body: req.files.photo.data, ACL:"public-read-write"
  };
  s3.putObject(params, function(err, data){
    if (err) {
      console.log(err)
    } else {
      // var url = 'https://s3-us-west-1.amazonaws.com/'+'code-testing/'+'pics1.jpg' //can change out later for more robust filepaths
      var url = 'https://s3-us-west-1.amazonaws.com/'+'code-testing/'+key //can change out later for more robust filepaths
      postToPython(url, username)
      res.send('sent to classifier, processing image');
    }
  })
});

router.post('/results', function (req, res) {
  var data = req.body.source;
  var results = data[0];
  var username = req.body.username;
  resultingClassification.push({
    results : results,
    username : username
  })
  console.log('REEESSUUULLLTTSSS','username', username)
  console.log('resultingClassification', resultingClassification)
  // io.on('connection', function(socket){
  // });
  // var io = req.app.get('socketio')
  // io.emit('classification', data[0])
  res.send('got ittt')
})

router.get('/', function(req,res){
  res.render('index.html')
})

router.post('/update', function (req, res) {
  var username = req.body.email;
  console.log('UUPPDAATTEE', req.body.email)
  var numberItems = resultingClassification.length
  var counter = 0
  var results = []
  resultingClassification.forEach((item)=>{
    if(item.username === username){
      var result = item.results;
      results.push(result)
      console.log('sending results', result)
      console.log("resultingClassificationBeginning", resultingClassification);
      resultingClassification.splice(item, 1);
      console.log("resultingClassificationEnding", resultingClassification);
    } else {
      counter++
    }
  })
  if (counter === numberItems) {
    res.send({success:false})
  } else {
    res.send({
      success : true,
      result : results[results.length-1]
    })    
  }
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
