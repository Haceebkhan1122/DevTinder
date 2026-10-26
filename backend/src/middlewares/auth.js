var jwt = require("jsonwebtoken");
const User = require("../models/user");
const AppError = require("../utils/appError");

// Errors thrown here (and jwt errors) go to the central error handler.
const userAuth = async (req, res, next) => {
    // Read the token from the req.cookies
    const { token } = req.cookies;

    // Validate token
    if (!token) {
        throw new AppError("Please login first!", 401);
    }
    const decodedObject = await jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedObject;

    // Find the user 
    const user = await User.findById(_id);
    if (!user) {
        throw new AppError("User not found, please login again!", 401);
    }

    // Token was issued before the password was changed (e.g. after reset password) -> old session is no longer valid
    if (user.changedPasswordAfter(decodedObject.iat)) {
        throw new AppError("Password was changed recently, please login again!", 401);
    }

    req.user = user;
    next();
}

module.exports = {
    userAuth
}
