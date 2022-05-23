const mongoose = require("mongoose");//importing mongoose(object data modeling library)
//creating structure of documents
const bookSchema = new mongoose.Schema(
  { 
    title: { type: String, required: true, trim: true },
    bookCover: { type: String},
    excerpt: { type: String, required: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ISBN: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true },
    subcategory: { type: [String], required: true },
    reviews: { type: Number, default: 0 },
    deletedAt: { type: Date},
    isDeleted: { type: Boolean, default: false },
    releasedAt: { type: Date, required: true },
  },
  { timestamps: true });
  

module.exports = mongoose.model("Book", bookSchema);//naming new collection made Schema
