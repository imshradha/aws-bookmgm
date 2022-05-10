const mongoose=require("mongoose")
const bookModel=require("../model/bookModel.js")
const userModel=require("../model/userModel")
const moment=require("moment")
const isValid=function(value){
    if(typeof value==="undefined" || value===null)return false 
    if(typeof value==="string" && value.trim().length===0)return false 
    return true
}
const isValidRequestBody=function(body){
    return Object.keys(body).length>0 
}
const isValidObjectId=function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}


const createBook = async function (req, res) {
    try {
        let body = req.body 
        
        if(!isValidRequestBody(body)){
            return res.status(400).send({status:false,message:"Invalid request parameters please provide blogs details"})
        }

    //Added loop for validation
    let required= ["title","excerpt","userId", "ISBN", "category","subcategory","releasedAt"]
    let keys= Object.keys(body)
   
    for(let i=0; i<required.length; i++){
        if(keys.includes(required[i])) continue
         else return res.status(400).send({ status: false, msg: `Required field - ${required[i]}`})
    }
   //checking for empty values
    for (const property in body) {
        if(typeof body[property] == 'string' && body[property].trim().length == 0)
        return res.status(400).send({ status: false, msg: `Required field - ${property}`})
      else continue
    }    
    
    let {title,userId,reviews,ISBN,releasedAt}=req.body 
    const uniqueTitle=await bookModel.findOne({title:title})
    if(uniqueTitle){
        return res.status(400).send({status:false,message:"Title is already registered"})
    }
    if(!(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/).test(ISBN)){
        return res.status(400).send({status:false,message:"Please give valid ISBN format"})
    }
    const uniqueISBN=await bookModel.findOne({ISBN:ISBN})
    if(uniqueISBN){
        return res.status(400).send({status:false,message:"ISBN is already registered"})
    }
    
    
    if(!isValidObjectId(userId)){
         return res.status(400).send({status:false,message:"Please provide valid userId"})
     }
     
     const isUser=await userModel.findById(userId)
     if(!isUser){
         return res.status(400).send({status:false,message:"User id not present"})
     }
    
    
     if(reviews){
         reviews=`Holds ${reviews} reviews of this book`
     }
    //releasedAt = new Date(releasedAt)
    console.log(releasedAt)
    let date1=moment(releasedAt).format("YYYY-MM-DD")
    console.log(releasedAt)
    body.releasedAt=date1

    
    let book=await bookModel.create(body)
    return res.status(201).send({status:true,message:"created successfully",data:book})
        
}
    catch (err) {
        
        return res.status(500).send({ status:false, error: err.message })
    }
}

const getBooks=async function(req,res){
    try{
        const query={isDeleted:false,deletedAt:null}
        const getQuery=req.query 
        if(isValidRequestBody(getQuery)){
            const {userId,category,subcategory}=getQuery 
            if(isValid(userId) && isValidObjectId(userId)){
                query.userId=userId
            }
            if(isValid(category)){
                query.category=category.trim()
            }
            
            if(isValid(subcategory)){
                const subcategoryArr=tags.trim().split(',').map(x=>x.trim())
                query.subcategory={$all:subcategoryArr}
            }
        }
        const getBook=await bookModel.find(query).select({title:1,excerpt:1,userId:1,category:1,releasedAt:1,reviews:1})
        if(getBook.length===0){
            return res.status(404).send({status:false,message:"No books found"})
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
        
        return res.status(200).send({status:true,message:"Books List",data:getBook})

            

        
    }
    catch(err){
        res.status(500).send({msg:err.message})
    }

}

module.exports={createBook,getBooks}