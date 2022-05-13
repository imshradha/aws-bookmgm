const jwt = require("jsonwebtoken");

const passwordValidator = require("password-validator");
const userModel = require("../model/userModel");

const isValidTitle = function (title) {
  return ["Mr", "Miss", "Mrs"].indexOf(title) !== -1;
};

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};
const isValidRequestBody = function (body) {
  return Object.keys(body).length > 0;
};

const createUser = async function (req, res) {
  try {
    let body = req.body;
    if(Object.keys(req.query).length!==0 ){
      return res.status(400).send({status:false,msg:"filtering not allow"})
    }

    if (!isValidRequestBody(body)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Invalid request parameters please provide user details",
        });
    }
    //Added loop for validation
    let required = ["title", "name", "phone", "email", "password"];
    let keys = Object.keys(body);

    for (let i = 0; i < required.length; i++) {
      if (keys.includes(required[i])) continue;
      else
        return res
          .status(400)
          .send({ status: false, msg: `Required field - ${required[i]}` });
    }
    //checking for empty values
    for (const property in body) {
      if (
        typeof body[property] == "string" &&
        body[property].trim().length == 0
      )
        return res
          .status(400)
          .send({ status: false, msg: `Required field - ${property}` });
      else continue;
    }
    const { title, phone, email, password, address } = req.body;

    if (!isValidTitle(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide right title" });
    }

    const isPhone = await userModel.findOne({ phone: phone });
    if (isPhone) {
      return res
        .status(400)
        .send({ status: false, message: "phone no is already registered" });
    }

    const validMobile = /^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone);
    if (!validMobile) {
      return res
        .status(400)
        .send({ status: false, msg: "Enter valid mobile no." });
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email should be valid" });
    }
    const isEmailPresent = await userModel.findOne({ email: email });
    if (isEmailPresent) {
      return res
        .status(400)
        .send({
          status: false,
          message: "email address is already registered",
        });
    }

    const schema = new passwordValidator();
    schema.is().min(8).max(15);
    if (!schema.validate(password)) {
      return res
        .status(400)
        .send({
          status: false,
          msg: "length of password should be 8-15 characters",
        });
    }
    
    //ADDRESS SHOULD BE IN OBJECT
    if(address){
      if(typeof(address) !=='object'){
        
        return res.status(400).send({status:false,message:"address should be in object form"})
      }

    if (address.pincode && (!/^[1-9][0-9]{5}$/.test(address.pincode))) {
      return res
        .status(400)
        .send({ status: false, message: "Incorrect pincode" });
    }
  
  
  
    if (address.city && (!/^[a-zA-Z ]+$/.test(address.city))) {
      return res
        .status(400)
        .send({
          status: false,
          message: "City name can only be alphabetically",
        });
    }
  }
  
    const user = await userModel.create(body);
    res
      .status(201)
      .send({ status: true, message: "created successfully", data: user });
  } catch (err) {
    res.status(500).send({ status: false, data: err.message });
  }
};

const loginUser = async function (req, res) {
  try {
    const requestBody = req.body;
    if (!isValidRequestBody(requestBody)) {
      return res
        .status(400)
        .send({ status: false, msg: "please provide data to signIn" });
    }
    const { email, password } = requestBody;

    if (!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, msg: "please provide email" });
    }
    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, msg: "please provide password" });
    }

    const findEmailAndPassword = await userModel.findOne({
      email: email,
      password: password,
    });
    if (!findEmailAndPassword) {
      return res
        .status(401)
        .send({ status: false, msg: "Please provide valid credentials" }); //401- for unauthorized--it lacks valid authentication credentials
    }

    const userId = findEmailAndPassword._id;

    const data = { email, password };
    if (data) {
      const token =jwt.sign(
        {
          userId: userId
        
        },
        "bookManagement-project3",{expiresIn:"24hr"}
      );
      res
        .status(200)
        .send({ status: true, msg: "user login sucessfully", token: token });
    }
  }catch (err) {
    res.status(500).send({ status: false, data: err.message });
  }
};
module.exports = { createUser, loginUser };
