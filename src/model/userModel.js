const mongoose = require("mongoose");//importing mongoose(object data modeling library)
//creating structure of documents also help in edits
const userSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      enum: ["Mr", "Mrs", "Miss"],
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, unique: true, required: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    address: {
      street: String,
      city: String,
      pincode: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);//naming new collection made Schema
//model:- inbuilt function in mongoose which helps us to create our schema in our database(mongo-Db)