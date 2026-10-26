const validator = require('validator');
const AppError = require('./appError');

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName || !lastName) {
        throw new AppError("Name is not valid!", 400);
    }
    else if (!validator.isEmail(emailId)) {
        throw new AppError("Email is not Valid!", 400);
    }
    else if (!validator.isStrongPassword(password)) {
        throw new AppError("Please enter a strong password!", 400);
    }
}

const validateLoginData = (req) => {
    const { emailId, password } = req.body;

    if (!emailId) {
        throw new AppError("Email is Required!", 400);
    }
    else if (!password) {
        throw new AppError("Password is Required!", 400);
    }
}

const validateEditProfileData = (req) => {
    const allowedEditFields = ["firstName", "lastName", "photoUrl", "gender", "age", "skills", "about"];
    const isEditAllowed = Object.keys(req.body).every((field => allowedEditFields.includes(field)));

    return isEditAllowed;
}

const validateForgotPasswordData = (req) => {
    const { emailId } = req.body;

    if (!emailId || typeof emailId !== "string") {
        throw new AppError("Email is Required!", 400);
    }
    else if (!validator.isEmail(emailId.trim())) {
        throw new AppError("Email is not Valid!", 400);
    }
}

const validateResetPasswordData = (req) => {
    const { token } = req.params;
    const { password } = req.body;

    // Raw reset token is always 64 hex characters (32 random bytes)
    if (!/^[a-f0-9]{64}$/.test(token)) {
        throw new AppError("Reset link is invalid or has expired!", 400);
    }
    else if (!password || typeof password !== "string") {
        throw new AppError("Password is Required!", 400);
    }
    // No trim: spaces can be part of the password, and login compares it as it is
    else if (!validator.isStrongPassword(password)) {
        throw new AppError("Please enter a strong password!", 400);
    }
}

module.exports = {
    validateSignUpData,
    validateLoginData,
    validateEditProfileData,
    validateForgotPasswordData,
    validateResetPasswordData
};