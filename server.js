const express = require("express")
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser');
const UR = require("./Routes/User")
const dotenv = require('dotenv');
const AR = require("./Routes/Admin");
require('./conn')

dotenv.config();
app.use(express.json())
app.use(cors())
app.use(cookieParser());
app.use('/user',UR)
app.use('/admin',AR)

app.get("/",(req,res)=>{
    res.send("server is up and running...")
})

app.listen(process.env.PORT || 5000,(e)=>{
    console.log("Server is up and runnig");
})