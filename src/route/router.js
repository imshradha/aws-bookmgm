const express = require('express');
const router = express.Router();
const {createUser,loginUser}=require("../controller/userController")
const{createBook,getBooks, deleteId}=require("../controller/bookController")
const{createReview,deleteReview,updateReview}=require("../controller/reviewController")




router.post("/register",createUser)
router.post("/login",loginUser)
router.post("/books",createBook)
router.get("/books",getBooks)
<<<<<<< HEAD
// router.get("/books/:bookId",getId)
// router.put("/books/:bookId",updateBooks)
// router.delete("/books/:bookId",deleteId)
router.post("/books/:bookId/review",createReview)
router.put("/books/:bookId/review/:reviewId",updateReview)
router.delete("/books/:bookId/review/:reviewId",deleteReview)
=======
router.get("/books/:bookId",getId)
router.put("/books/:bookId",updateBooks)
router.delete("/books/:bookId",deleteId)
>>>>>>> 471cbd02d229991fbaec3e42d6d06ca03fb3836f

module.exports = router;