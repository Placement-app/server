const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/placementapp")
  .then(() => console.log("DB Connected"))
  .catch((e) => {
    console.log(e);
  });
