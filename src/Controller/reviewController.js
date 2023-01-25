const { default: mongoose } = require("mongoose");
const reviewModel = require("../Models/reviewModel");

const validator = require("validator");
const bookModel = require("../Models/bookModel");
let validReview = /^[a-z , A-Z0-9_]+$/
const createReview = async function(req,res){
    try{
    let data = req.body

    if(Object.keys(data).length===0) return res.status(400).send({status:false,message:"plz send data for create review"})
    if(!data) return res.status(400).send ({status:false,messaage: "plz send review Data"})
    
    let {reviewedBy,rating,review} = data

       
    
    let bookId = req.params.bookId
    data.bookId=bookId  
    data.isDeleted =  false
    data.reviewedAt=Date.now()
    
     if(!bookId) return res.status(400).send({status:false,massage: "bookId is required"})
     if(!mongoose.isValidObjectId(bookId)) return res.status(400).send ({status:false,massage:"bookId is not a valid ObjectId"})
  
     if(!reviewedBy)  return res.status(400).send ({status:false,message:"reviewer's name is required"})
     if(!validator.isAlpha(reviewedBy.split(" ").join(""))) return res.status(400).send({status:false,msg:"plz enter valid name"})
      
     if(!rating ) return res.status(400).send ({status:false,mesage:"rating is required"})
    
     if(!(rating>=0 && rating<=5))return res.status(400).send({ status: false, msg: "rating should be in between 0 to 5" })


     if(typeof rating!="number") return res.status(400).send ({status:false,mesage:"invalid rating / rating must be innumber"})
     
     if(review){

         if(validator.isAlphanumeric(review))  return res.status(400).send ({status:false,message:"review is invalid"})
     }
    
     
    let book = await bookModel.findOneAndUpdate({_id:bookId,isDeleted:false},{$inc:{reviews:1}},{new:true}).lean().select({__v:0})
    if(!book) return res.status(404).send({status:false,message:"books not found"})
     
     const savedData = await reviewModel.create(data)
     let reviewsData = await reviewModel.find({bookId:bookId,isDeleted:false}).select({createdAt:0,updatedAt:0,isDeleted:0,__v:0})
     
     book.reviewsData=reviewsData    
 
     res.status(200).send({status:true,message:"Book List",data:book})
  
    }
    catch(error){
      return res.status(500).send({status:false, message:error.message})
    }
  }



  const reviewUpdate = async function (req, res) {
    try {
        let data = req.body;
        const  { rating , review, reviewedBy} = data

        if (Object.entries(data).length == 0) {
            return res.status(400).send({ status: false, msg: "please provide some data" })
        }
        
        let bookId = req.params.bookId;
        if (!bookId)
        return res.status(400).send({ status: false, msg: " please enter bookId" })

        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg:  "enter valid book id"})
        }
        if (rating < 1 || rating > 5) return res.status(400).send({ status: false, msg: "rating should be inbetween 1 and 5" })
        if(rating){ if(typeof rating != "number"){ return res.status(400).send({msg:"Invalid value of rating"})} }
        if(review){ if(typeof review != "string"){ return res.status(400).send({msg:"Invalid value of review"})} }
        if(reviewedBy){ if(typeof reviewedBy != "string"){ return res.status(400).send({msg:"Invalid value of reviewedBy"})} }
        let book = await bookModel.findOne({ _id: bookId, isDeleted: false });

        if (!book) {
            return res.status(404).send({ status: false, msg: "Book  not found" })
        }

        let reviewId = req.params.reviewId;

        if (!reviewId)
        return res.status(400).send({ status: false, msg: " please enter rewiewId" })

        if (!mongoose.isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, msg: "enter valid review id" })
        }

        let reviewExit = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!reviewExit) {
            return res.status(404).send({ status: false, msg: "review  not exists" })
        }
    //    if(typeof rating != "number" || typeof review != "string"|| typeof reviewedBy != "string"){
    //     return res.send({msg: "please do check what you are sending"})
    //    }
      
      

        let savedData = await reviewModel.findOneAndUpdate({ _id: reviewId },
            data, { updatedAt: new Date(), new: true })
        return res.status(200).send({ status: true, msg: savedData });
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}




const reviewDelete = async function (req, res) {
    try {
   
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;

        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "enter valid book id" })
        }

        if (!mongoose.isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, msg: "enter valid review id" })
        }

        // let review = await reviewModel.findOne({ _id: reviewId, bookId: bookId ,isDeleted: false })
        // if (!review) {
        //     return res.status(404).send({ status: false, msg: "Review  not found and may be resource has been deleted" })
        // }
        
       let deleteReview =  await reviewModel.findOneAndUpdate({ _id: reviewId,isDeleted : false },
            {$set: { isDeleted: true, deletedAt: new Date() }});
            
        if(!deleteReview) return res.status(404).send({status:true,message:"not found or data is deleted"})
           
            let book = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false },{$inc:{reviews:-1}},{new:true})
            if (!book) {
                return res.status(404).send({ status: false, msg: "Book  not found" })
            }

        return res.status(200).send({ status: true, msg: 'Deleted successfully' });
    }

    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}





module.exports = {createReview,reviewUpdate,reviewDelete}