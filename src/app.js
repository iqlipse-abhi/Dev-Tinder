const express = require("express");
// const connectDB = require("./config/db");
const app = express();
const User = require("./models/User");
// const {validSignUpData} = require("./utils/validation");
const cookieParser = require("cookie-parser");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
const {userAuth} = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());


app.use("/signup", async (req, res) => {
    try{
        const { emailId, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ emailId, password: hashedPassword });
        await user.save();
        res.status(200).send("User created successfully");
    } catch(error) {
        res.send(500).send("Faild to signup");
    }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId }); // here user is getting binded hence in user.js "this" keyword refers to this user object.
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordVaildInDb = await user.validatePassword(password); // isPasswordValid is a method defined in user.js model. Also we are passing the user entered passwork from here.
    if (isPasswordVaildInDb) {
      const token = await user.getJWT();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 3600000), // 1 hour
      });
      res.send("Login successful");
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/profile",userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    return res.status(400).send("Unable to find the profile.");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
