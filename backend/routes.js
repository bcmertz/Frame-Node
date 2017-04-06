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
// var Clarifai = require('clarifai');
// var io=require('socket.io')(server)

var mongoose = require('mongoose')


var s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});



// var clari = new Clarifai.App(
//   process.env.idd,
//   process.env.password
// );
// clari.getToken();

var postToPython = function (data) {
  console.log('data',data)
  var options = {
    host: 'sample-env.m359bd53gp.us-west-2.elasticbeanstalk.com/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(data)
    }
  };
  var httpreq = http.request(options, function (response) {
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      console.log("body: " + chunk);
    }).on('error', function(err) {
      res.send('error');
    }).on('end', function() {
      res.send('ok');
    })
  }).on('error', function(e){
    console.log(e)
  });
  httpreq.write(data);
  httpreq.end();
}


router.post('/upload', function (req, res) {
  var tempPath = req.files.photo;
  var targetPath = path.join(__dirname, './uploadedpics');
  console.log('req.files.photo:', req.files.photo);
  targetPath = targetPath + '/pic.jpg'
  console.log('targetPath:', targetPath)
  // tempPath.mv(targetPath, function(err) {
  //   if (err) {
  //     console.log('err:', err)
  //     res.send(err);
  //   }
    console.log('image uploaded, saving to aws')
    // var params = {Bucket: 'code-testing', Key: 'pics.jpg', Body: targetPath};
    var params = {
      Bucket: 'code-testing', Key: 'pics1.jpg', Body: req.files.photo.data, ACL:"public-read-write"
    };
    s3.putObject(params, function(err, data){
    if (err) {
      console.log(err)
    } else {
      var url = 'https://s3-us-west-1.amazonaws.com/'+'code-testing/'+'pics1.jpg' //can change out later for more robust filepaths
      postToPython(url)
      res.send('sent to classifier, processing image');
    }
    })
  //})
});

router.post('/results', function (req, res) {
  var data = req.body.source
  console.log('recieved', data, ', sending relevant results back to the iphone-app')

  //process data here//

  // socket.emit('respond', data)
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
