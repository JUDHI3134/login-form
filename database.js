const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); //jsonwebtoken always apply on database
require("dotenv").config();

mongoose
  .connect(process.env.DB)
  .then(() => {
    //use process.env.DB insted of "mongodb://127.0.0.1:27017/project1"
    console.log("connection successful");
  })
  .catch((e) => {
    console.log(e);
  });

const schema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  phone: {
    type: Number,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  confirmpassword: {
    type: String,
    require: true,
  },
  tokens: [
    {
      token: {
        type: String, //store token in the database
        require: true,
      },
    },
  ],
});

//token
schema.methods.generateToken = async function() {
  try {
    const tokenuser = jwt.sign({ _id: this._id.toString() }, process.env.KEY); //use process.env.KEY insted of "helloThisisJsonwebtokenasdfghjkloiuytrewq"
    this.tokens = this.tokens.concat({ token: tokenuser });
    await this.save();
    return tokenuser;
  } catch (error) {}
};

//password encryption
schema.pre("save", async function (next) {
  if(this.isModified("password")){           // use if login not seccessful
  this.password = await bcrypt.hash(this.password, 10);

  }
  next();

});

const usermodel = mongoose.model("userdetails", schema);
module.exports = usermodel;
