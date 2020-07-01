const express = require("express");
const bodyParser = require("body-parser");
const AWS = require("aws-sdk");
const upload = require('express-fileupload')
var fs = require('fs');
var path = require('path');

let app = express();

//Configure AWS
AWS.config.update({region: 'ap-south-1'});
s3 = new AWS.S3({apiVersion: '2006-03-01'});

app.use(upload())
app.use(bodyParser.urlencoded({extended:true}));

app.listen(3000, () => console.log("Server running on port 3000..."))

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", (req, res) => {

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "filename") is used to retrieve the uploaded file
  let sampleFile = req.files.filename;
      filename = sampleFile.name;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(__dirname + "/upload/" + filename, function(err) {
    if (err)
      return res.status(500).send(err);

    res.write('File uploaded!\n');

  });

  var uploadParams = {Bucket: process.argv[2], Key: '', Body: ''};
  var file = __dirname + "/upload/" + filename;


  var fileStream = fs.createReadStream(file);
  fileStream.on('error', function(err) {
    console.log('File Error', err);
  });

  uploadParams.Body = fileStream;
  uploadParams.Key = path.basename(file);

  // call S3 to retrieve upload file to specified bucket
  s3.upload (uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
      res.write("Error:"+err)
      res.send()
    } if (data) {
      console.log("Upload Success", data.Location);
      res.write("Upload Success at link : "+data.Location)
      res.send()
    }
  });
  
  fs.unlink(__dirname + "/upload/" + filename, (err) => {
  if (err) {
    console.error(err)
    return
  }
  //file removed from upload folder
  })
})
