const express = require("express");
const router = express.Router();
const user = require("./database");
const bcrypt = require("bcryptjs");
const cookieparser = require("cookie-parser");
const auth = require("./authorization");

//signup route
router.get("/", (req, res) => {
  res.render("index");
});
//login route
router.get("/loginn", (req, res) => {
  res.render("login");
});
//Authorization page
router.get("/auth", auth, (req, res) => {
  res.render("auth");
});

//register form

router.post("/register", async (req, res) => {
  try {
    const data = new user(req.body);
    if (data.password === data.confirmpassword) {
      //email validation
      const emailvalidation = await user.findOne({ email: data.email });
      if (emailvalidation) {
        res.send("Email already Exist ! please Login to Continue");
      }
      //

      //function call for token user
      const token = await data.generateToken();
      console.log("this token is : " + token);

      res.cookie("jwt", token); //generate cookie

      const savedata = await data.save();
      res.render("login");
    } else {
      res.status(404).send("password does not match");
    }
  } catch (error) {
    res.status(404).send(error);
  }
});

//login form

router.post("/login", async (req, res) => {
  try {
    const checkemail = req.body.email;
    const passworduser = req.body.password;
    const databasedata = await user.findOne({ email: checkemail });
    const ismatch = bcrypt.compare(passworduser, databasedata.password);
    if (ismatch) {
      // ismatch is replace by (databasedata.password === passworduser ) due to bcrypt password
      const token = await databasedata.generateToken(); //this line only generate token in login copy from registration section
      res.cookie("jwt", token); //cookie

      res.render("contact");
    } else {
      res.status(404).send("email does not exist");
    }
  } catch (error) {
    res.status(404).send(error);
  }
});

//logout route
router.get("/logout", async (req, res) => {
  try {
    req.user.tokens = [];
    res.clearCookie("jwt");
    const userdata = await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
