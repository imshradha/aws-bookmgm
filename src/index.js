const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const route = require('./route/route')
const multer= require("multer");
const { AppConfig } = require('aws-sdk');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use( multer().any())


mongoose.connect("mongodb+srv://Shreya1998:1234.qwer@cluster0.gzlyp.mongodb.net/group20Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))//return fulfilled promise
.catch ( err => console.log(err) )//return rejected promise

app.use('/', route);//act as global middleware to excute

app.listen(process.env.PORT || 4000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 4000))
});