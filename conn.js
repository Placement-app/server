const mongoose = require("mongoose");
// var password = encodeURIComponent("#Y1a2h3y4a5");
// console.log(password);
mongoose
  .connect(`mongodb://localhost:27017`)
  .then(() => console.log("DB Connected"))
  .catch((e) => {
    console.log(e);
  });
