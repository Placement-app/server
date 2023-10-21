const mongoose = require("mongoose")

const UserSchema  =new  mongoose.Schema({
    name:{type:String},
    password:{type:String},
    regno:{type:String},
    email:{type:String,unique:true}
}) 
 
const UM = mongoose.model('user',UserSchema)
module.exports = UM 