//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Making aws connection here ^^^^^^^^^^^^^^^^^^^^^^^\\

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ This data is provided by working professionals ^^^^^^^^^^\\
const aws = require("aws-sdk")
aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Here main insertion part done in aws ^^^^^^^^^^^^^^^^^^^^^^\\

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    //************ This function will upload file to aws and return the link ****************\\
    let s3= new aws.S3({apiVersion: '2006-03-01'}); //************ We will be using the s3 service of aws ******\\

    var uploadParams= {
        ACL: "public-read", //******** Accesible publically ****************\\
        Bucket: "classroom-training-bucket",  //*********** Folder **********\\
        Key: "abc/" + file.originalname , //*************** Sub Folder *******\\
        Body: file.buffer //********************* Reading file ****************\\
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)   //******************* From here we are sending location or link of that uploaded file ****\\
    })

   })
}


module.exports={uploadFile}