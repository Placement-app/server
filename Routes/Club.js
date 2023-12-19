const express = require("express");
const CR = express.Router();
const bcrypt = require("bcrypt");
const CM = require("../model/ClubSchema");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const AR = require("./Admin");
const RM = require("../model/ResourceSchema");
const  {Types}= require("mongoose")
const slider = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "Resources/carousel/"); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  }),
});
CR.use(
  "/carousel",
  express.static(path.join(__dirname, "../Resources/carousel/"))
);

CR.post("/login", async (req, res) => {
  try {
    const { id, password } = req.body;
    if (id == "" || password == "") {
      res.json({ msg: "Please fill all the fields!" });
    } else {
      const findbyCid = await CM.findOne({ cid: id });
      console.log(findbyCid);
      console.log(id);
      console.log(password);
      if (!findbyCid) {
        res.json({ msg: "Email or Password is wrong!" });
      } else {
        bcrypt.compare(password, findbyCid.password, function (err, result) {
          if (err) {
            console.log(err);
            res.json({ msg: "Something went wrong!" });
          } else if (result) {
            const token = jwt.sign(
              {
                name: findbyCid.name,
                id: findbyCid._id,
                email: findbyCid.email,
                founder: findbyCid.founder,
                about: findbyCid.about,
                statement: findbyCid.statement,
                cid: findbyCid.cid,
                logo: findbyCid.logo
              },
              process.env.token,
              { expiresIn: 10 * 24 * 60 * 60 }
            );
            res.cookie("CAUAT", token, { httpOnly: true });
            res.status(200).json({ msg: "Access granted", token });
          } else {
            res.json({ msg: "Email or Password is wrong!" });
          }
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.json({ msg: "Something went wrong!" });
  }
});

CR.post("/protected", (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  jwt.verify(token, process.env.token, (err, decoded) => {
    if (err) {
      return res.status(403).json({ msg: "Token validation failed" });
    }
    res.json({
      msg: "Access granted",
      name: decoded.name,
      id: decoded._id,
      email: decoded.email,
      founder: decoded.founder,
      about: decoded.about,
      statement: decoded.statement,
      cid: decoded.cid,
      logo: decoded.logo,
    });
  });
});


CR.post("/addcarousel", async (req, res) => {
  try {
    const { img, content, cid, name, founder,logo } = req.body;
    if (img == "" || content == "" || cid == "" || name == "" || founder == "") {
      res.json({ msg: "please fill all the details!",created:false });
    } else {
      const  addResource = await RM.findByIdAndUpdate({ _id: new Types.ObjectId("65800a8a9e7e237d51bbdc73")},{
        $push: {
          carousel: {
            cid: cid,
            name: name,
            founder: founder,
            logo: logo,
            data: {
              img: img,
              content: content,
              approved: false
            }
          }
        }
      })
      const addClubAdmin = await CM.findOneAndUpdate({ cid: cid }, { carousel: { img, content, approved: "pending" } })
      if (addResource && addClubAdmin) {
        res.json({ msg: "Request sent successfully.",created:true })
      } else {
        res.json({ msg: "Something went wrong!",created:false })
      }
    }
  } catch (error) {
    console.log(error);
    res.json({ msg: "SMO" });
  }
});
CR.post("/verify_carousel",async(req,res)=>{
  try {
      const {cid}=req.body
      const data = await CM.findOne({cid:cid})
      res.json(data)
    } catch (error) {
        res.json({msg:"Something went wrong!"})
    }
})
CR.post("/uploadcarousel", slider.single("carousel"), async (req, res) => {
  try {
    if (!req.file) {
      res.json({ msg: "No file uploaded." });
    } else {
      res.json({ msg: "Done", path: req.file.filename });
    }
  } catch (error) {
    res.json({ msg: "SMO" });
  }
});
CR.post("/remove_carousel", async (req, res) => {
  try {
    const { cid } = req.body;
      const addClubAdmin = await CM.findOneAndUpdate({ cid: cid }, { carousel: { img:null} })
      if (addClubAdmin) {
        res.json({ msg: "Removed successfully try again.",removed:true })
      } else {
        res.json({ msg: "Something went wrong!",removed:false })
      }
  } catch (error) {
    res.json({ msg: "Something went wrong!",removed:false });
  }
});
module.exports = CR;
