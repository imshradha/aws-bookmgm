const express = require('express');
const router = express.Router();
const {createUser,loginUser}=require("../controller/userController")
const{createBook,getBooks, deleteId}=require("../controller/bookController")
const{createReview,deleteReview,updateReview}=require("../controller/reviewController")




router.post("/register",createUser)
router.post("/login",loginUser)
router.post("/books",createBook)
router.get("/books",getBooks)
// router.get("/books/:bookId",getId)
// router.put("/books/:bookId",updateBooks)
// router.delete("/books/:bookId",deleteId)
router.post("/books/:bookId/review",createReview)
router.put("/books/:bookId/review/:reviewId",updateReview)
router.delete("/books/:bookId/review/:reviewId",deleteReview)

module.exports = router;