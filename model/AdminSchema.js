const mongoose = require("mongoose")

const AdminSchema  =new  mongoose.Schema({
    name:{type:String},
    password:{type:String},
    regno:{type:String},
    email:{type:String,unique:true}
}) 
 
const AM = mongoose.model('admin',AdminSchema)
module.exports = AM 