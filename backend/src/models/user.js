const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { RESET_TOKEN_EXPIRY_MS } = require("../utils/constants");


const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address: " + value);
            }
        },
    },
    password: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 60,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Enter strong password: " + value);
            }
        },
    },
    age: {
        type: Number,
        min: 18,
        max: 40,
    },
    gender: {
        type: String,
        enum: {
            values: ["male", "female", "others"],
            message: `{VALUE} is incorrect gender type`
        },
        // validate(value) {
        //     if (!["male", "female", "others"].includes(value)) {
        //         throw new Error("Gender type is not Valid!")
        //     }
        // },
    },
    photoUrl: {
        type: String,
        default: "https://img.magnific.com/free-vector/user-circles-set_78370-4704.jpg?semt=ais_hybrid&w=740&q=80",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid image url: " + value);
            }
        },
    },
    about: {
        type: String,
        default: "This is a default about of the User!",
        minLength: 30,
        maxLength: 200,
    },
    skills: {
        type: [String],
    },
    // Only the SHA-256 hash of the reset token is stored, the raw token goes to the user's email
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    // When the password was last changed (JWTs issued before this are rejected in userAuth)
    passwordChangedAt: {
        type: Date
    }
},
    {
        timestamps: true,
    });


// Automatically strip the password when converting to JSON
userSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.passwordChangedAt;
        return ret;
    }
});

userSchema.methods.getJWT = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user?._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return token;
}

userSchema.methods.validatePassword = async function (usersTypedPassword) {
    const user = this;
    const passwordHash = user.password;
    const isPasswordValidate = await bcrypt.compare(usersTypedPassword, passwordHash);
    return isPasswordValidate;
}

// Hashes a raw reset token (used when saving it and when looking it up in reset password)
userSchema.statics.hashResetToken = function (resetToken) {
    return crypto.createHash("sha256").update(resetToken).digest("hex");
}

// true if the password was changed after the JWT was issued (jwtIssuedAt = decoded.iat, in seconds)
userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
    const user = this;
    if (!user.passwordChangedAt) {
        return false;
    }
    return jwtIssuedAt * 1000 < user.passwordChangedAt.getTime();
}

// Creates a password reset token: stores its hash + expiry on the user and returns the raw token (for the email link).
// A new request overwrites the old token, so only the latest link works.
userSchema.methods.createPasswordResetToken = function () {
    const user = this;
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = User.hashResetToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    return resetToken;
}

const User = mongoose.model("User", userSchema);

module.exports = User;