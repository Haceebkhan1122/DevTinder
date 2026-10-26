const mongoose = require("mongoose");
const AppError = require("../utils/appError");

// Checks that req.params[paramName] is a valid MongoDB ObjectId before hitting the DB.
// Usage: router.post("/path/:userId", userAuth, validateObjectId("userId"), handler)
const validateObjectId = (paramName) => (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params[paramName])) {
        throw new AppError(`Invalid ${paramName}!`, 400);
    }
    next();
}

module.exports = {
    validateObjectId
}
