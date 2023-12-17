const mongoose = require("mongoose");

const ResourecSchema = new mongoose.Schema({
  carousel: [
    {
      img: { type: String },
      content: { type: String },
      price: { type: Number },
      cid: { type: String },
      approved: { type: Boolean },
      logo: { type: String },
      name: { type: String },
      founder: { type: String },
    },
  ],
  news: [
    {
      head: { type: String },
      content: { type: String },
      date: { type: Date },
      approved: { type: Boolean },
    },
  ],
  trending: [
    {
      cid: { type: String },
      approved: { type: Boolean },
    },
  ],
});

const RM = mongoose.model("resources", ResourecSchema);
module.exports = RM;
