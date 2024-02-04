const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: { type: String },
    password: { type: String },
    regno: { type: String },
    email: { type: String, unique: true },
    clubs: [{ cid: { type: String }, role: { type: String }, status: { type: String } }],
    socials: { github: { type: String }, linkedin: { type: String } }
})

const UM = mongoose.model('user', UserSchema)
module.exports = UM 