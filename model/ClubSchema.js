const mongoose = require("mongoose");

const ClubSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  founder: { type: String },
  about: { type: String },
  statement: { type: String },
  logo: { type: String },
  docs: { type: String },
  password: { type: String },
  cid: { type: String, unique: true },
  logo: { type: String },
  docs: { type: String },
  carousel: {
    img: { type: String },
    content: { type: String },
    approved: { type: String },
  },
  news: {
    head: { type: String },
    description: { type: String },
    content: { type: String },
    approved: { type: String },
    date: { type: Date },
  },
  status: { type: Boolean },
  event: {
    timeStart: { type: String },
    timeEnd: { type: String },
    title: { type: String },
    description: { type: String },
    content: { type: String },
    approved: { type: String },
    link: { type: String }
  }
});

const CM = mongoose.model("club", ClubSchema);
module.exports = CM;
