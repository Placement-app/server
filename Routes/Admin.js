const express = require("express");
const AR = express.Router();
const AM = require("../model/AdminSchema");
const CM = require("../model/ClubSchema");
const RM = require("../model/ResourceSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { Types } = require("mongoose");

const logo = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "Resources/logo/"); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  }),
});
AR.use("/clublogo", express.static(path.join(__dirname, "../Resources/logo/")));

const verification = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "Resources/verification/"); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  }),
});
AR.use(
  "/clubverificationdocs",
  express.static(path.join(__dirname, "../Resources/verification/"))
);

AR.post("/signup", async (req, res) => {
  try {
    const { name, regno, email, password } = req.body;
    if (name == "" || password == "" || regno == "" || email == "") {
      res.json({ msg: "Please fill all the fields" });
    } else {
      const findbyEmail = await AM.find({ email });
      if (findbyEmail.length > 0) {
        res.json({ msg: "User already exists" });
      } else {
        bcrypt.genSalt(Number(process.env.SaltNo), async (err, salt) => {
          if (err) {
            return res.status(500).json({ msg: "Something went wrong!" });
          } else {
            const combinedSalt = `${salt}${process.env.Salt}`;
            const hashedPassword = await bcrypt.hash(password, combinedSalt);
            const user = await AM.create({
              name,
              password: hashedPassword,
              regno,
              email,
            });
            if (user) {
              const token = jwt.sign(
                {
                  name: user.name,
                  id: user._id,
                  regno: user.regno,
                  email: user.email,
                },
                process.env.token,
                { expiresIn: 10 * 24 * 60 * 60 }
              );
              res.cookie("AAUAT", token, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
              });
              res.json({ msg: { token } });
            } else {
              res.json({ msg: "Something went wrong!" });
            }
          }
        });
      }
    }
  } catch (error) {
    res.json({ msg: "Something went wrong!" });
  }
});

AR.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email == "") {
      res.json({ msg: "Please fill all the fields!" });
    } else {
      const findbyEmail = await AM.findOne({ email });

      if (findbyEmail == null) {
        res.json({ msg: "Email or Password is wrong!" });
      } else {
        bcrypt.compare(password, findbyEmail.password, function (err, result) {
          if (err) {
            res.json({ msg: "Something went wrong!" });
          } else if (result) {
            const token = jwt.sign(
              {
                name: findbyEmail.name,
                id: findbyEmail._id,
                regno: findbyEmail.regno,
                email: findbyEmail.email,
              },
              process.env.token,
              { expiresIn: 10 * 24 * 60 * 60 }
            );
            res.cookie("AAUAT", token, { httpOnly: true });
            res.json({ msg: { token } });
          } else {
            res.json({ msg: "Email or Password is wrong!" });
          }
        });
      }
    }
  } catch (error) {
    res.json({ msg: "Something went wrong!" });
  }
});

AR.post("/protected", (req, res) => {
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
      regno: decoded.regno,
      email: decoded.email,
    });
  });
});


AR.post("/addclub", async (req, res) => {
  try {
    const { name, email, founder, about, statement, logo, docs } = req.body;
    if (
      name == "" ||
      founder == "" ||
      email == "" ||
      about == "" ||
      statement == "" ||
      logo == "" || docs == ""
    ) {
      res.json({ msg: "Please fill all the fields", created: false });
    } else {
      const findbyEmail = await CM.findOne({ email });
      if (!findbyEmail) {
        bcrypt.genSalt(Number(process.env.SaltNo), async (err, salt) => {
          if (err) {
            return res.status(500).json({ msg: "Something went wrong!", created: false });
          } else {
            const val = email + new Date().getTime();
            const combinedSalt = `${salt}${process.env.Salt}`;
            const hashedPassword = await bcrypt.hash(val, combinedSalt);
            const user = await CM.create({
              name,
              email,
              founder,
              about,
              statement,
              password: hashedPassword,
              cid: val,
              logo, docs,
              carousel: { img: null, content: "", approved: "" }
            });
            if (user) {

              res.json({ msg: { id: val, created: true } });
            } else {
              res.json({ msg: "Something went wrong!", created: false });
            }
          }
        });
      } else {
        res.json({ msg: "Email already found!", created: false });
      }
    }
  } catch (error) {
    res.json({ msg: "Something went wrong!", created: false });
  }
});
AR.post("/clublogo", logo.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      res.json({ msg: "No file uploaded." })
    } else {
      res.json({ msg: "Done", path: req.file.filename })
    }

  } catch (error) {
    res.json({ msg: "SMO" })
  }
})
AR.post("/clubverificationdocs", verification.single('verification'), async (req, res) => {
  try {
    if (!req.file) {
      res.json({ msg: "No file uploaded." })
    } else {
      res.json({ msg: "Done", path: req.file.filename })
    }

  } catch (error) {
    res.json({ msg: "SMO" })
  }
})

AR.get("/clubs", async (req, res) => {
  try {
    const send = await CM.find()
    res.json({ msg: send })
  } catch (error) {
    res.json({ msg: "SMO" })
  }
})
AR.get("/carousel_approval", async (req, res) => {
  try {
    const send = await RM.findById("6581a4c014f4c02b6f32ab00")
    res.json({ msg: send })
  } catch (error) {
    res.json({ msg: "SMO" })
  }
})
AR.post("/serachclubs", async (req, res) => {
  try {
    const { cid } = req.body
    const msg = await CM.findOne({ cid: cid })
    res.json(msg)
  } catch (error) {
    res.json({ msg: "SMO" })
  }
})

AR.post("/approve_carousel", async (req, res) => {
  try {
    const { cid, img, content } = req.body
    const UpdateCM = await CM.findOneAndUpdate({ cid: cid }, {
      carousel: {
        img: img,
        content: content, approved: "Approved"
      }
    })
    const UpdateRM = await RM.findByIdAndUpdate({ _id: new Types.ObjectId("6581a4c014f4c02b6f32ab00") }, {
      $pull: {
        carousel: {
          cid: cid
        }
      }
    })
    const UpdateApprovedCarousel = await RM.findByIdAndUpdate({ _id: new Types.ObjectId("6581a4e414f4c02b6f32ab01") }, {
      $push: {
        ApprovedCarousel: {
          cid: cid,
          img,
        }
      }
    })
    if (UpdateCM && UpdateRM && UpdateApprovedCarousel) {
      res.json({ msg: "Approved successfully.", approved: true })
    } else {
      res.json({ msg: "Something went wrong!", approved: false })
    }
  } catch (error) {
    res.json({ msg: "Something went wrong!", approved: false })
  }
})
AR.get('/approved_carousels', async (req, res) => {
  try {

    const data = await RM.findById({ _id: new Types.ObjectId("6581a4e414f4c02b6f32ab01") })
    res.json(data.ApprovedCarousel)
  } catch (error) {
    res.json({ msg: "Something went wrong!" })
  }
})
AR.post("/remove_carousel", async (req, res) => {
  try {
    const { cid } = req.body
    const UpdateCM = await CM.findOneAndUpdate({ cid: cid }, {
      carousel: { img: null }
    })
    const UpdateApprovedCarousel = await RM.findByIdAndUpdate({ _id: new Types.ObjectId("6581a4e414f4c02b6f32ab01") }, {
      $pull: {
        ApprovedCarousel: {
          cid: cid
        }
      }
    })
    if (UpdateCM && UpdateApprovedCarousel) {
      res.json({ msg: "Removed successfully.", removed: true })
    } else {
      res.json({ msg: "Something went wrong!", removed: false })
    }
  } catch (error) {
    res.json({ msg: "Something went wrong!", removed: false })
  }
})
AR.post("/decline_carousel", async (req, res) => {
  try {
    const { cid,img,content } = req.body
    const UpdateCM = await CM.findOneAndUpdate({ cid: cid }, {
      carousel: {img,content, approved: "Denied" }
    })
    const UpdateRM = await RM.findByIdAndUpdate({ _id: new Types.ObjectId("6581a4c014f4c02b6f32ab00") }, {
      $pull: {
        carousel: {
          cid: cid
        }
      }
    })
    if (UpdateCM && UpdateRM) {
      res.json({ msg: "Denied successfully.", denied: true })
    } else {
      res.json({ msg: "Something went wrong!", denied: false })
    }
  } catch (error) {
    res.json({ msg: "Something went wrong!", denied: false })
  }
})
module.exports = AR;
