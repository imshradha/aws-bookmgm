const ObjectId=require("mongoose").Types.ObjectId
const bookModel = require("../model/bookModel")
const reviewModel = require("../model/reviewModel")

const isValidRequestBody=function(body){
    return Object.keys(body).length>0 
}
const isValid=function(value){
    if(typeof value==="undefined" || value===null)return false 
    if(typeof value==="string" && value.trim().length===0)return false 
    return true
}


const createReview=async function(req,res){
    try{
    const {bookId}=req.params 
    if(!ObjectId.isValid(bookId)){
        return res.status(400).send({status:false,message:"Please enter valid bookId"})
    }
  

    let validBook=await bookModel.findOne({_id:bookId,isDeleted:false}).select({deletedAt:0})
    if(!validBook){
        return res.status(404).send({status:false,message:"No book found"})
    }
    
    if(!isValidRequestBody(req.body)){
        return res.status(400).send({status:false,message:"Please enter required parameters"})
    }
   
    const{rating,reviewedBy}=req.body 
    if(!isValid(rating)){
        return res.status(400).send({status:false,message:"Please enter rating"})
    }
    if(!(/(^[1-5]{1}\.[1-5]|^[1-5]{1}$)/).test(rating)){
        return res.status(400).send({status:false,message:"Rate between 1-5"})
    }
    
    validBook.reviews=validBook.reviews + 1 
    validBook.save()    //save() method INSERTs an object in the database

    let body=req.body 
    body.bookId=bookId
    body.reviewedAt = new Date()
    
    let review1=await reviewModel.create(body)
    let findReview=await reviewModel.find({bookId:bookId,isDeleted:false})
    
    Object.assign(validBook._doc, { reviewsData: [findReview] });
    
    return res.status(201).send({status:true,message:"Created Successfully",data:validBook})
}
catch(err){
    return res.status(500).send({status:false,message:err.message})
}
}

const updateReview=async function(req,res){
       try{
        const {bookId,reviewId}=req.params 
        if(!ObjectId.isValid(bookId)){
            return res.status(400).send({status:false,message:"Please enter valid bookId"})
        }
        if(!ObjectId.isValid(reviewId)){
            return res.status(400).send({status:false,message:"Please enter valid reviewId"})
        }


        let body=req.body
        const{rating}=body
        
        
        const validBook=await bookModel.findOne({_id:bookId,isDeleted:false}).select({deletedAt:0})
      
      if(!validBook){
          
        return res.status(404).send({status:false,message:"No book found"})
      }
        
        const validReviewId=await reviewModel.findOne({_id:reviewId,isDeleted:false})
        
       if(!validReviewId){
        return res.status(404).send({status:false,message:"Review does not exist"})
       }
       
      if(bookId != validReviewId.bookId){
        return res.status(400).send({status:false,message:"This review is not for this book"})
      }
      if(!(isValidRequestBody(body))){
          return res.status(400).send({status:false,message:"Please provide data to update review"})
      }
      if(!(/(^[1-5]{1}\.[1-5]|^[1-5]{1}$)/).test(rating)){
        return res.status(400).send({status:false,message:"Rate between 1-5"})
    }
    body.reviewedAt = new Date()
      let updatedReview=await reviewModel.findByIdAndUpdate(reviewId,body,{new:true})
      let getReviewsData=await reviewModel.find({bookId:bookId,isDeleted:false})
      Object.assign(validBook._doc, { reviewsData: [getReviewsData] });
      return res.status(200).send({status:true,message:"Review Updated",data:validBook})
       }
     catch(err){
         return res.status(500).send({status:false,message:err.message})
     }
}

const deleteReview=async function(req,res){
    try{
    const{reviewId,bookId}=req.params 
    if(!ObjectId.isValid(bookId)){
        return res.status(400).send({status:false,message:"Please enter valid bookId"})
    }
    if(!ObjectId.isValid(reviewId)){
        return res.status(400).send({status:false,message:"Please enter valid reviewId"})
    }


    const validBook=await bookModel.findOne({_id:bookId,isDeleted:false})
    if(!validBook){
        return res.status(404).send({status:false,message:"NO book found"})
    }
    
    const validReviewId=await reviewModel.findOne({_id:reviewId,isDeleted:false})
    if(!validReviewId){
        return res.status(404).send({status:false,message:"Review does not exist"})
    }
    if(bookId != validReviewId.bookId){
        return res.status(400).send({status:false,message:"This review is not for this book"})
      }
    
    await reviewModel.findOneAndUpdate({_id:reviewId},{$set:{isDeleted:true}})

    validBook.reviews=validBook.reviews-1
    validBook.save()    //save() method INSERTs an object in the database

    return res.status(200).send({status:true,message:"Review deleted and book's review updated successfully"})
}
catch(err){
    return res.status(500).send({status:false,message:err.message})
}
}
module.exports={createReview,updateReview,deleteReview}