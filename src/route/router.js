const express = require('express');
const router = express.Router();
const {createUser,loginUser}=require("../controller/userController")
const{createBook,getBooks,getId,updateBooks, deleteId}=require("../controller/bookController")
const{createReview,deleteReview,updateReview}=require("../controller/reviewController")
const{authenticate}=require("../middleware/mid")

//User
router.post("/register",createUser)
router.post("/login",loginUser)
//BOOK
router.post("/books",authenticate,createBook)
router.get("/books",authenticate,getBooks)
router.get("/books/:bookId",authenticate,getId)
router.put("/books/:bookId",authenticate,updateBooks)
router.delete("/books/:bookId",authenticate,deleteId)
 //REVIEW
router.post("/books/:bookId/review",createReview)
router.put("/books/:bookId/review/:reviewId",updateReview)
router.delete("/books/:bookId/review/:reviewId",deleteReview)

module.exports = router;