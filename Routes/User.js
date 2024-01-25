const express = require("express");
const UR = express.Router();
const UM = require("../model/UserSchema");
const RM = require("../model/ResourceSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Types } = require("mongoose");
const AM = require("../model/AdminSchema");
const CM = require("../model/ClubSchema");

UR.post("/signup", async (req, res) => {
  try {
    const { name, regno, email, password } = req.body;
    if (name == "" || password == "" || regno == "" || email == "") {
      res.json({ msg: "Please fill all the fields" });
    } else {
      const findbyEmail = await UM.find({ email });
      if (findbyEmail.length > 0) {
        res.json({ msg: "User already exists" });
      } else {
        bcrypt.genSalt(Number(process.env.SaltNo), async (err, salt) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ msg: "Something went wrong!" });
          } else {
            const combinedSalt = `${salt}${process.env.Salt}`;
            const hashedPassword = await bcrypt.hash(password, combinedSalt);
            const user = await UM.create({
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
              res.cookie("PAUAT", token, {
                httpOnly: true,
                secure: true,
                sameSite: "lax"
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

UR.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email == "") {
      res.json({ msg: "Please fill all the fields!" });
    } else {
      const findbyEmail = await UM.findOne({ email });

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
            res.cookie("PAUAT", token, { httpOnly: true });
            res.json({ msg: { token } });
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

UR.post("/protected", (req, res) => {
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

UR.get("/carousel", async (req, res) => {
  const find = await AM.findById({ _id: new Types.ObjectId("659c1a2211919f5bfb0a84e6") })
  let carousel = []
  find.carousel.map((e, i) => {
    e.position !== 0 ? carousel.push(e) : null
  })

  carousel.sort((a, b) => a.position - b.position)
  res.json({ data: carousel })
})

UR.get("/news", async (req, res) => {
  const find = await AM.findById({ _id: new Types.ObjectId("659c1a2211919f5bfb0a84e6") })
  let news = []
  find.news.map((e, i) => {
    e.position !== 0 ? news.push(e) : null
  })

  news.sort((a, b) => a.position - b.position)
  console.log(find);
  res.json({ data: news })
})

UR.get("/clubs", async (req, res) => {
  try {
    const find = await CM.find()
    console.log(find);
    res.json({ data: find })
  } catch (error) {
    res.json({ data: "Something went wrong!" })
  }
})

module.exports = UR;
