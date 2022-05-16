const mongoose = require("mongoose");//importing mongoose(object data modeling library)
//creating structure of documents
const reviewSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  reviewedBy: { type: String, required: true, default: "Guest" },
  reviewedAt: { type: Date },
  rating: { type: Number, required: true },
  review: { type: String },
  isDeleted: { type: Boolean, default: false },
});
module.exports = mongoose.model("Review", reviewSchema);//naming new collection made Schema
