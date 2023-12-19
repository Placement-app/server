const mongoose = require("mongoose");

const ResourecSchema = new mongoose.Schema({

  carousel: [
    {
      cid: { type: String },
      name: { type: String },
      founder: { type: String },
      logo: { type: String },
      data: {
        img: { type: String },
        content: { type: String },
        approved: { type: String }
      }
    }
  ],
  news: [{
    head: { type: String },
    content: { type: String },
    date: { type: Date },
    approved: { type: Boolean },
  }],
  trending: [{
    head: { type: String },
    content: { type: String },
    approved: { type: Boolean },
  }],
  ApprovedCarousel:[
    {
      cid:{type:String},
      img:{type:String},
    }
  ]
});

const RM = mongoose.model("resources", ResourecSchema);
module.exports = RM;
