const express = require('express');
const router = express.Router();
const {createUser,loginUser}=require("../controller/userController")
const{createBook,getBooks}=require("../controller/bookController")




router.post("/register",createUser)
router.post("/login",loginUser)
router.post("/books",createBook)
router.get("/books",getBooks)
// router.get("/books/:bookId",getId)
// router.put("/books/:bookId",updateBooks)
// router.delete("/books/:bookId",deleteId)

module.exports = router;