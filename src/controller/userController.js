const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")

const passwordValidator = require('password-validator');
const userModel=require("../model/userModel")

const isValidTitle=function(title){
    return ["Mr","Miss","Mrs","Master"].indexOf(title)!==-1
}

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};
const isValidRequestBody=function(body){
    return Object.keys(body).length>0 
}

const createUser= async function (req, res) {
    try {
        let body = req.body
        if(!isValidRequestBody(body)){
            return res.status(400).send({status:false,message:"Invalid request parameters please provide author details"})
        }
        const {title,name,phone,email,password,address}=req.body
        if(!isValid(title)){
            return res.status(400).send({status:false,message:"Please enter title"})
        }
        
        if(!isValidTitle(title)){
            return res.status(400).send({status:false,message:"Please provide right title"})

        }
        if(!isValid(name)){
            return res.status(400).send({status:false,message:"Please enter name"})
        }
        if (!isValid(phone)) {
            res
              .status(400)
              .send({ status: false, message: " Please enter phone no" });
            return;
          }
        const isPhone=await userModel.findOne({phone:phone})
        if(isPhone){
              return res.status(400).send({status:false,message:"phone no is already registered"})
        }  
      
        const validMobile = /^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone);
        if (!validMobile) {
            return res
              .status(400)
              .send({ status: false, msg: "Enter valid mobile no." });
        }
    
        if(!isValid(email)){
            return res.status(400).send({status:false,message:"Please enter email"})
        }
        
        if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))){
           return res.status(400).send({status:false,message:"Email should be valid"})
        }
        const isEmailPresent=await userModel.findOne({email:email})
        if(isEmailPresent){
            return res.status(400).send({status:false,message:"email address is already registered"})
        }

        if(!isValid(password)){
            return res.status(400).send({status:false,message:"Please enter password"})
        }
        const schema = new passwordValidator();
        schema.is().min(8).max(15)
        if (!schema.validate(password)) {
            return res.status(400).send({ status: false, msg: "length of password should be 8-15 characters" })
        }
        if(typeof address.pincode==NaN){
            res.status(400).send({status:false,message:"Only number is  allowed"})
        }
        if (Object.values(address.pincode).length < 6 || (address.pincode).length > 6) {
            return res.status(400).send({ status: false, msg: "Pincode should be of 6 digits" })
        }
         
        if (!/^[a-zA-Z]+$/.test(address.city)) {
            return res.status(400).send({ status: false, message: "City name can only be alphabetically" });
        }
        const user=await userModel.create(body)
        res.status(201).send({status:true,message:"created successfully",data:user})
    }
    catch (err) {
        
        res.status(500).send({ status:false, data: err.message })
    }

}

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
      // ADD PASSWORD VALIDATOR
  
      const findEmailAndPassword = await userModel.findOne({email: email,password:password });
      if (!findEmailAndPassword) {
        return res
          .status(400)
          .send({ status: false, msg: "Please provide valid credentials" });
      }
  
      const userId=findEmailAndPassword._id
  
      const data = { email, password };
      if (data) {
        
        const token= await jwt.sign({
            userId: userId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 10*60*60
          }, 'bookManagement-project3')
        res
          .status(200)
          .send({ msg: "user login sucessfully", token:token });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ status: false, data: err.message });
    }
  };
module.exports={createUser,loginUser}
