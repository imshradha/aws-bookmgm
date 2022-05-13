const ObjectId=require("mongoose").Types.ObjectId
const bookModel = require("../model/bookModel.js");
const userModel = require("../model/userModel");

const reviewModel = require("../model/reviewModel.js");
const moment = require("moment");

//====================================Validation===========================================

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};
const isValidRequestBody = function (body) {
  return Object.keys(body).length > 0;
};


//=======================================

const createBook = async function (req, res) {
  try {
    let body = req.body;
    const userToken = req.userId;

    if (Object.keys(req.query).length !== 0) {
      return res.status(400).send({ status: false, msg: "filtering not allow" });
    }

    if (!isValidRequestBody(body)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters please provide books details",
      });
    }

    //Added loop for validation
    let required = [
      "title",
      "excerpt",
      "userId",
      "ISBN",
      "category",
      "subcategory",
      "releasedAt",
    ];
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
    if(!ObjectId.isValid(userId)){
      return res.status(400).send({status:false,message:"Please enter valid userId"})
  }


    //Authorization
    if (body.userId.toString() !== userToken) {
      return res
        .status(401)
        .send({ status: false, message: "Unauthorised access" });
    }

    let { title, userId, ISBN, releasedAt } = req.body;
    const uniqueTitle = await bookModel
      .findOne({
        title: title,
      })
      .collation({ locale: "en", strength: 2 });

    if (uniqueTitle) {
      return res
        .status(400)
        .send({ status: false, message: "Title is already registered" });
    }
    if (!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN)) {
      return res
        .status(400)
        .send({ status: false, message: "Please give valid ISBN format" });
    }
    const uniqueISBN = await bookModel.findOne({ ISBN: ISBN });
    if (uniqueISBN) {
      return res
        .status(400)
        .send({ status: false, message: "ISBN is already registered" });
    }

    

    const isUser = await userModel.findById(userId);
    if (!isUser) {
      return res
        .status(400)
        .send({ status: false, message: "User id not present" });
    }
    let date1=moment.utc(releasedAt,'YYYY-MM-DD') // UNIVERSAL TIME COORDINATED,IF WE ONLY USE MOMENT SO IT WORK IN LOCAL MODE
    if(!date1.isValid()){
      return res.status(400).send({status:false,message:"Check the date format"})
      
    }
    body.releasedAt=date1
    

    let book = await bookModel.create(body);
    return res
      .status(201)
      .send({ status: true, message: "created successfully", data: book });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

const getBooks = async function (req, res) {
  try {
    const getQuery = req.query;
    let query = { isDeleted: false};
    if (isValidRequestBody(getQuery)) {
      const { userId, category, subcategory } = getQuery;
      if (isValid(userId) && ObjectId.isValid(userId)) {
        query.userId = userId;
      }
      if (isValid(category)) {
        query.category = category.trim();
      }

      if (isValid(subcategory)) {
        const subcategoryArr = subcategory
          .trim()
          .split(",")
          .map((x) => x.trim());
        query.subcategory = { $all: subcategoryArr }; //selects the documents where the value of a field is an array that contains all the specified elements
      }
    }
    const getBook = await bookModel.find(query).select({title:1,excerpt:1,userId:1,category:1,releasedAt:1,reviews:1});
    if (getBook.length === 0) {
      return res.status(404).send({ status: false, message: "No books found" });
    }

    getBook.sort((a, b) => {
      let fa = a.title.toLowerCase(),
        fb = b.title.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    return res
      .status(200)
      .send({ status: true, message: "Books List", data: getBook });
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
};
const getId = async function (req, res) {
  try {
    let id = req.params.bookId;
    if(!ObjectId.isValid(id)){
      return res.status(400).send({status:false,message:"Please enter valid bookId"})
  }

    let book = await bookModel.findOne({
      _id: id,
      isDeleted: false
    }).select({deletedAt:0});

    if (!book) {
      //if no data found then send error message
      return res.status(404).send({ status: false, data: "book not present" });
    }
    let reviewData = await reviewModel.find({ bookId: book._id });
    if (book.reviews == 0) {
      Object.assign(book._doc, { reviewsData: [] });
    } else {
      Object.assign(book._doc, { reviewsData: [reviewData] });
    }

    return res
      .status(200)
      .send({ status: true, message: "Book List", data: book });
  } catch (err) {
    res.status(500).send({ status: false, data: err.message });
  }
};

const updateBooks = async function (req, res) {
  try {
    const reqbody = req.body;
    let id = req.params.bookId;
    const userToken = req.userId;
    if(!ObjectId.isValid(id)){
      return res.status(400).send({status:false,message:"Please enter valid bookId"})
    }
    if(!ObjectId.isValid(userToken)){
      return res.status(400).send({status:false,message:"Please enter valid userId"})
    }
    
    let book = await bookModel.findOne({
      _id: id,
      isDeleted: false
    });

    if (!book) {
      //if no data found then send error message
      return res.status(404).send({ status: false, data: "book not present" });
    }
    if (book.userId.toString() !== userToken) {
      return res
        .status(401)
        .send({ status: false, message: "Unauthorised access" });
    }
    
    

    if (!isValidRequestBody(reqbody)) {
      return res.status(400).send({
        status: true,
        message: "Please provide paramters to update book",
      });
    }
    const { title, ISBN, excerpt, releasedAt, reviews, category, subcategory } =
      reqbody;
    if (reviews || category || subcategory) {
      return res
        .status(400)
        .send({
          status: false,
          msg: "you can't update reviews,category,subcategory ",
        });
    }

    const updateBook = {};

    if (isValid(title)) {
      let validUserId = await bookModel.findOne({
        title: title,
        isDeleted: false,
      }).collation(
        { locale: 'en', strength: 2 }
      );
      if (validUserId) {
        return res
          .status(400)
          .send({ status: false, message: "Title already registered" });
      }
      updateBook.title = req.body.title;
    }
    if (isValid(excerpt)) {
      updateBook.excerpt = req.body.excerpt;
    }
    if (isValid(releasedAt)) {
      updateBook.releasedAt = req.body.releasedAt;
    }

    if (isValid(ISBN)) {
      let validISBN = await bookModel.findOne({ ISBN: ISBN });
      if (validISBN) {
        return res
          .status(400)
          .send({ status: false, message: "ISBN already registered" });
      }
      updateBook.ISBN = req.body.ISBN;
    }

    const bookUpdate = await bookModel.findOneAndUpdate(
      { _id: id },
      updateBook,
      {
        new: true,
      }
    );

    res.status(200).send({
      status: true,
      message: "Updated Successfully",
      data: bookUpdate,
    });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

const deleteId = async function (req, res) {
  try {
    let id = req.params.bookId;
    const userToken = req.userId;
    if(!ObjectId.isValid(id)){
      return res.status(400).send({status:false,message:"Please enter valid bookId"})
    }
    if(!ObjectId.isValid(userToken)){
      return res.status(400).send({status:false,message:"Please enter valid userId"})
    }
    
    
    let book = await bookModel.findOne({
      _id: id,
      isDeleted: false
    });

    if (!book) {
      //if no data found then send error message
      return res.status(404).send({ status: false, data: "book not present" });
    }
    if (book.userId.toString() !== userToken) {
      return res
        .status(401)
        .send({ status: false, message: "Unauthorised access" });
    }
    
    

    await bookModel.findOneAndUpdate(
      { _id: id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    await reviewModel.updateMany({bookId:id},{$set:{isDeleted:true}})

    return res
      .status(200)
      .send({ status: true, message: "Book deleted succesfully" });
  } catch (err) {
    res.status(500).send({ status: false, data: err.message });
  }
};

module.exports = { createBook, getBooks, getId, updateBooks, deleteId };
