const express = require("express");
const CR = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const AR = require("./Admin");
const { Types } = require("mongoose");
const RM = require("../model/ResourceSchema");
const AM = require("../model/AdminSchema");
const CM = require("../model/ClubSchema");
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

CR.post("/protected", async (req, res) => {
  try {

    const token = req.body.token;
    if (!token) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    jwt.verify(token, process.env.token, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ msg: "Token validation failed" });
      }
      const findbyCid = await CM.findOne({ cid: decoded.cid });

      if (findbyCid) {
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
      } else {
        res.json({
          msg: "Account deleted"
        })
      }
    });

  } catch (error) {

  }
});

// Carousel
CR.post("/addcarousel", async (req, res) => {
  try {
    const { img, content, cid, name, founder, logo, link } = req.body;
    if (img == "" || content == "" || cid == "" || name == "" || founder == "") {
      res.json({ msg: "please fill all the details!", created: false });
    } else {
      const addAdmin = await AM.findByIdAndUpdate({ _id: new Types.ObjectId("659c1a2211919f5bfb0a84e6") }, {
        $push: {
          carousel: {
            cid: cid,
            name: name,
            founder: founder,
            logo: logo,
            img: img,
            content: content,
            approved: false,
            link: link ? link : null,
            position: 0
          }
        }
      })
      const addClubAdmin = await CM.findOneAndUpdate({ cid: cid }, { carousel: { img, content, approved: "pending" } })
      if (addAdmin && addClubAdmin) {
        res.json({ msg: "Request sent successfully.", created: true })
      } else {
        res.json({ msg: "Something went wrong!", created: false })
      }
    }
  } catch (error) {
    console.log(error);
    res.json({ msg: "SMO" });
  }
});
CR.post("/verify_carousel", async (req, res) => {
  try {
    const { cid } = req.body
    const data = await CM.findOne({ cid: cid })
    res.json(data)
  } catch (error) {
    res.json({ msg: "Something went wrong!" })
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
CR.delete("/remove_carousel", async (req, res) => {
  try {
    const { cid } = req.body;
    const addClubAdmin = await CM.findOneAndUpdate({ cid: cid }, { carousel: { img: null } })
    if (addClubAdmin) {
      const imagePath = path.join(__dirname, '../Resources/carousel/', addClubAdmin.carousel.img);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        res.json({ msg: "Removed successfully try again.", removed: true })
      } else {
        res.json({ msg: "Something went wrong1!", removed: false })
      }
    } else {
      res.json({ msg: "Something went wrong2!", removed: false })
    }
  } catch (error) {
    console.log(error);
    res.json({ msg: "Something went wrong!", removed: false });
  }
});

//News
CR.post("/addnews", async (req, res) => {
  try {
    const { description, content, cid, name, founder, logo, link, head } = req.body;
    if (description == "" || content == "" || cid == "" || name == "" || founder == "") {
      res.json({ msg: "Please fill all the details!", created: false });
    } else {
      const date = new Date().toISOString()
      const addAdmin = await AM.findByIdAndUpdate({ _id: new Types.ObjectId("659c1a2211919f5bfb0a84e6") }, {
        $push: {
          news: {
            cid: cid,
            name: name,
            founder: founder,
            logo: logo,
            head: head,
            content: content,
            description: description,
            date: date,
            approved: false,
            position: 0,
            link: link !== "" || link !== null ? link : null
          }
        }
      })
      const addClubAdmin = await CM.findOneAndUpdate({ cid: cid }, { news: { head, description, link: link, content: content, date: date, approved: "Pending" } })

      if (addAdmin && addClubAdmin) {
        res.json({ msg: "Request sent successfully.", created: true })
      } else {
        res.json({ msg: "Something went wrong!", created: false })
      }
    }
  } catch (error) {
    res.json({ msg: "Something went wrong!", created: false })
  }
});
CR.post("/verify_news", async (req, res) => {
  try {
    const { cid } = req.body
    const data = await CM.findOne({ cid: cid })
    res.json(data)
  } catch (error) {
    res.json({ msg: "Something went wrong!" })
  }
})
CR.post("/remove_news", async (req, res) => {
  try {
    const { cid } = req.body;
    const addClubAdmin = await CM.findOneAndUpdate({ cid: cid }, { news: { head: null } })
    if (addClubAdmin) {
      res.json({ msg: "Removed successfully try again.", removed: true })
    } else {
      res.json({ msg: "Something went wrong!", removed: false })
    }
  } catch (error) {
    res.json({ msg: "Something went wrong!", removed: false });
  }
});

//Events
CR.post("/addevent", async (req, res) => {
  try {
    const { timeStart, timeEnd, title, description, content, cid, link, name, founder, logo } = req.body;
    if (timeStart == "" || timeEnd == "" || title == "" || description == "" || content == "" || cid == "") {
      res.json({ msg: "Please fill all the details!", created: false });
    } else {
      const addAdmin = await AM.findByIdAndUpdate({ _id: new Types.ObjectId("659c1a2211919f5bfb0a84e6") }, {
        $push: {
          events: {
            cid,
            timeStart,
            timeEnd,
            title,
            description,
            content,
            approved: false,
            link: link ? link : null,
            name,
          }
        }
      })
      const addClubAdmin = await CM.findOneAndUpdate({ cid: cid }, {
        event: {
          timeStart,
          timeEnd,
          title, description, content, approved: "Pending"
        }
      })
      if (addAdmin && addClubAdmin) {
        res.json({ msg: "Request sent successfully.", created: true })
      } else {
        res.json({ msg: "Something went wrong!", created: false })
      }
    }
  } catch (error) {
    console.log(error);
    res.json({ msg: "Something went wrong!", created: false });
  }
});
CR.post("/verify_event", async (req, res) => {
  try {
    const { cid } = req.body
    const data = await CM.findOne({ cid: cid })
    res.json(data)
  } catch (error) {
    res.json({ msg: "Something went wrong!" })
  }
})
CR.post("/remove_event", async (req, res) => {
  try {
    const { cid } = req.body;
    const addClubAdmin = await CM.findOneAndUpdate({ cid: cid }, { event: { title: null } })
    if (addClubAdmin) {
      res.json({ msg: "Removed successfully try again.", removed: true })
    } else {
      res.json({ msg: "Something went wrong!", removed: false })
    }
  } catch (error) {
    res.json({ msg: "Something went wrong!", removed: false });
  }
});
module.exports = CR;