const express = require("express");
const CR = express.Router();
const bcrypt = require("bcrypt");
const CM = require("../model/ClubSchema");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const AR = require("./Admin");
const AM = require("../model/AdminSchema");
const RM = require("../model/ResourceSchema");
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
                logo:findbyCid.logo
              },
              process.env.token,
              { expiresIn: 10 * 24 * 60 * 60 }
            );
            res.cookie("CAUAT", token, { httpOnly: true });
            res.json({ msg: "Access granted", token });
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
    const { img, price, content,cid,logo,name,founder } = req.body;
    if (img == "" || price == "" || content == "") {
      res.json({ msg: "please fill alll the details!" });
    } else {
      const addResource = await RM.findByIdAndUpdate({_id:Object("655a24967e0b3129b893215b")},{
        $push: { carousel: { img, price, content,cid:cid,approved:false,logo,name,founder } }
      })
      const addClubAdmin = await CM.findOneAndUpdate({cid:cid},{carousel: { img, price, content,cid:cid,approved:false }})
      if(addResource && addClubAdmin){
        res.json({msg:"Done"})
      }else{
        res.json({msg:"Not Done"})
      }

    }
  } catch (error) {
    console.log(error);
    res.json({ msg: "SMO" });
  }
});

CR.post("/uploadcarousel", slider.single("carousel"), async (req, res) => {
  try {
    console.log(req.file);
    if (!req.file) {
      res.json({ msg: "No file uploaded." });
    } else {
      res.json({ msg: "Done", path: req.file.filename });
    }
  } catch (error) {
    res.json({ msg: "SMO" });
  }
});
module.exports = CR;
