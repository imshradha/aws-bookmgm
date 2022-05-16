const express = require('express');
const bodyParser = require('body-parser');//middleware which process data send throught http request body
const route = require('./route/router.js'); //import route file to excute api's
const { default: mongoose } = require('mongoose');//importing mongoose(object data modeling library)
const app = express();//assign express to variable

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://Shreya1998:1234.qwer@cluster0.gzlyp.mongodb.net/group20Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))//return fulfilled promise
.catch ( err => console.log(err) )//return rejected promise


app.use('/', route);//act as global middleware to excute


app.listen(process.env.PORT || 4000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 4000))
});