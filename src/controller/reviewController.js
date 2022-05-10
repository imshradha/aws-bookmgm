const mongoose=require("mongoose")
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
const isValidObjectId=function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}


const createReview=async function(req,res){
    try{
    const {bookId}=req.params 
    if(!(isValidObjectId(bookId))){
        return res.status(400).send({status:false,message:"Please enter valid bookId"})
    }
    if(!isValidRequestBody(req.body)){
        return res.status(400).send({status:false,message:"Please enter required parameters"})
        
    }
    let validBook=await bookModel.findOne({_id:bookId,isDeleted:false,deletedAt:null})
    if(!validBook){
        return res.status(404).send({status:false,message:"No book found"})
    }
    const{rating,reviewedBy}=req.body 
    if(!isValid(rating)){
        return res.status(400).send({status:false,message:"Please enter rating and rating must be no"})
    }
    if(rating<1 || rating >5){
        return res.status(400).send({status:false,message:"Ratings can be in 1 to 5"})
    }
    
    if(!isValid(reviewedBy)){
        return res.status(400).send({status:false,message:"Please enter rating and rating must be no"})
    }
    validBook.reviews=validBook.reviews+1 

    validBook.save()
    let body=req.body 
    body.bookId=bookId
    
    let review1=await reviewModel.create(body)
    let findReview=await reviewModel.find({bookId:bookId,isDeleted:false,deletedAt:null})
    console.log(findReview)
    
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
        let body=req.body
        if(!(isValidObjectId(bookId))){
            return res.status(400).send({status:false,message:"Not a  valid bookId"})
        }
        if(!(isValidObjectId(reviewId))){
            return res.status(400).send({status:false,message:"Not a valid reviewId"})
        }
        const validReviewId=await reviewModel.findOne({_id:reviewId,isDeleted:false,deletedAt:null})
       if(!validReviewId){
        return res.status(404).send({status:false,message:"Review does not exist"})
       }
       const validBook=await bookModel.findOne({_id:bookId,isDeleted:false,deletedAt:null})
      if(!validBook){
        return res.status(404).send({status:false,message:"No book found"})
      }
      if(!(isValidRequestBody(body))){
          return res.status(400).send({status:false,message:"Please provide data to update review"})
      }
      let updatedReview=await reviewModel.findByIdAndUpdate(reviewId,body,{new:true})
      let getReviewsData=await reviewModel.find({bookId:bookId})
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
    if(!(isValidObjectId(bookId))){
        return res.status(400).send({status:false,message:"Not a valid bookId"})
    }
    if(!(isValidObjectId(reviewID))){
        return res.status(400).send({status:false,message:"Not a valid reviewId"})
    }
    const validReviewId=await reviewModel.findOne({_id:reviewId,isDeleted:false,deletedAt:null})
    if(!validReviewId){
        return res.status(404).send({status:false,message:"Review does not exist"})
    }
    const validBook=await bookModel.findOne({_id:bookId,isDeleted:false,deletedAt:null})
    if(!validBook){
        return res.status(404).send({status:false,message:"NO book found"})
    }
    await reviewModel.findOneAndUpdate({_id:reviewId},{$set:{isDeleted:true}})
    validBook.reviews=validBook.reviews-1
    validBook.save()
    return res.status(200).send({status:true,message:"Review deleted and book's review updated successfully"})
}
catch(err){
    return res.status(500).send({status:false,message:err.message})
}
}
module.exports={createReview,updateReview,deleteReview}