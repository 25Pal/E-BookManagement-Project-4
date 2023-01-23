const bookModel = require("../Models/bookModel")


const  mongoose  = require("mongoose")
const validator = require("validator")
const userModel = require("../Models/userModel")
const reviewModel = require("../Models/reviewModel")


let isbnRegex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/g



const createBook = async (req,res)=>{
    try {
    let data = req.body
    if(Object.keys(data).length===0) return res.status(400).send({status:false,msg:"plz provide valid details"})

    let {title,excerpt,userId,ISBN,category,subcategory,reviews,releasedAt} = data

    if (!title) { return res.status(400).send({ status: false, message: "title is required" }) }
    if(!validator.isAlpha(title))  return res.status(400).send({status:false,msg:"plz provide valid title"})

    if(!excerpt) return res.status(400).send({status:false,msg:"excerpt is mandatory"})
    if(!validator.isAlpha(excerpt))  return res.status(400).send({status:false,msg:"plz provide valid excerpt"})

    if(!userId) return res.status(400).send({status:false,msg:"userId is mandatory"})
    if(!mongoose.isValidObjectId(userId)) return res.status(400).send({status:false,msg:"plz provide valid userId"})
    if(userId != req.tokenDetails.userId) return res.status(400).send({status:false,msg:"This userId is not exist in token"})
    if(!ISBN) return res.status(400).send({status:false,msg:"ISBN is mandatory"})
    if(!isbnRegex.test(ISBN)) return res.status(400).send({status:false,message:"Invalid ISBN"})

    if(!category) return res.status(400).send({status:false,msg:"category is mandatory"})
    if(!validator.isAlpha(category))  return res.status(400).send({status:false,msg:"plz provide valid category"})

    if(!subcategory) return res.status(400).send({status:false,msg:"subcategory is mandatory"})
    if(!validator.isAlpha(subcategory))  return res.status(400).send({status:false,msg:"plz provide valid subcategory"})
   
    if(!releasedAt) return res.status(400).send({status:false,message:"Releaased date is mandatory, formate (YYYY/MM/DD) "})
    if(!validator.isDate(releasedAt)) return res.status(400).send({status:false,message:"Invalid date or formate,plz send date in this formate (YYYY/MM/DD) "})

    if(reviews) {
        if(typeof(reviews) != "number") return res.status(400).send({status:false,msg:"plz provide valid review"})
    }

    let findUser = await userModel.findById({_id:userId})
    if(!findUser) return res.status(404).send({status:true,message:"User not found, check userId"})
    

    let findBook = await bookModel.findOne({ $or: [{ title: title }, { ISBN: ISBN }] })
    if(findBook) return res.status(409).send({status:false,message:"given details already exist"})

    let createBook = await bookModel.create(data)
    let {__v, ...otherData} = createBook._doc
  
    res.status(201).send({status:true,data:otherData})
   } catch (error) {
    console.log("error in create book", error.message);
    res.send(error.message)
   }
  
}

const getBooks = async(req,res)=>{
    try {
    let data = req.query
  
    let keys = Object.keys(data)

    data.isDeleted = false

    if(keys.length===0) {
        let getAllBooks = await bookModel.find(data).sort({ title: 1 }).select({ ISBN: 0, subcategory: 0, isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        if(getAllBooks.length===0) return res.status(404).send({status:false,message:"document not found"})
        let lengthOfAllbooks = getAllBooks.length
        return res.status(200).send({status:true,count:lengthOfAllbooks,data:getAllBooks})
    }

    if(keys.includes("userId")){
        if(!mongoose.isValidObjectId(data.userId)) return res.status(400).send({status:false,message:"userID is invalid"})
    } 
    if(keys.includes("category")){
        if(!validator.isAlpha(data.category))  return res.status(400).send({status:false,msg:"plz provide valid category value"})
    }
    if(keys.includes("subcategory")){
        if(!validator.isAlpha(data.subcategory))  return res.status(400).send({status:false,msg:"plz provide valid subcategory value"})
    }

    let getBooks = await bookModel.find(data).sort({ title: 1 }).select({ ISBN: 0, subcategory: 0, isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })

    if(getBooks.length===0) return res.status(404).send({status:false,message:"document not found"})

    let lengthOfgetbooks = getBooks.length

    res.status(200).send({status:true,count:lengthOfgetbooks,data:getBooks})

    } catch (error) {
        console.log("error in getBooks", error.message);
        res.status(500).send({msg:error.message})
    }

    

}


const getBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId;

        if (!bookId) return res.status(400).send({ msg: "please enter bookId" })
        
        if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "bookId is not valid" })
        
        let bookData = await bookModel.findById({ _id: bookId, isDeleted: false }).lean()

        if (!bookData) return res.status(404).send({ msg: "no book found" })
        
        let booksReviews = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ createdAt: 0, updatedAt: 0, isDeleted: 0, __v: 0 })

        bookData.booksReviews = booksReviews

        res.status(200).send({ status: true, message: "Book List", data: bookData })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = {createBook,getBooks,getBookById}