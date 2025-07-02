
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50,
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Invalid email address " + value);
            }
        }
    },
    password:{
        type: String,
        required: true,
        minLength: 6,
        maxLength: 100,
        validate(value) {
            if(!validator.isStrongPassword(value)){
                throw new Error("Password must be strong");
            }
        },
    },
    gender: {
        type: String,
        validate(value) {
            if(!["male", "female", "other"].includes(value)) {
                throw new Error("Gneder Data is not valid");
            }
        },
    },
    age : {
        type: Number,
        min: 18,
    },
    photoUrl: {
        type: String,
        default: "https://example.com/default-photo.jpg",
        validate(value) {
            if(!validator.isURL(value)) {
                throw new Error("Photo URL is not valid");
            }
        },
    },
    about: {
        type: String,
        maxLength: 500,
        default: "No information provided",
    },
    skills: {
        type: [String],
    },
},
{
    timestamps: true,
});

userSchema.methods.getJWT = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
    return token;
}

userSchema.methods.validatePassword = async function(userEnteredPassword) {
    const user = this;
    hashedPasswordInDb = user.password;
    const isPasswordValidInDb = await bcrypt.compare(userEnteredPassword, hashedPasswordInDb);
    if (!isPasswordValidInDb) {
        throw new Error("Invalid Password");
    }
    return isPasswordValidInDb;
}

module.exports = mongoose.model("User", userSchema);
