const mongoose = require("mongoose");
var password = encodeURIComponent("#Y1a2h3y4a5");
console.log(password);
mongoose
  .connect(`mongodb+srv://yahyasaadme:${password}@textapps.er1hajy.mongodb.net/placementapp?retryWrites=true&w=majority`)
  .then(() => console.log("DB Connected"))
  .catch((e) => {
    console.log(e);
  });
