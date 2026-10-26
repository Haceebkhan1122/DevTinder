const AppError = require("../utils/appError");

// Unknown routes
const notFoundHandler = (req, res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// Central error handler: every error thrown in routes/middlewares ends up here.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = "Something went wrong, please try again later!";

    if (err instanceof AppError) {
        // Errors we throw ourselves
        statusCode = err.statusCode;
        message = err.message;
    } else if (err.name === "ValidationError") {
        // Mongoose schema validation failed
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.name === "CastError" ? `Invalid value for ${e.path}!` : e.message)
            .join(", ");
    } else if (err.name === "CastError") {
        // Invalid ObjectId or wrong type (e.g. age: "abc")
        statusCode = 400;
        message = `Invalid value for ${err.path}!`;
    } else if (err.code === 11000) {
        // Duplicate key (e.g. email already registered)
        statusCode = 409;
        message = `${Object.keys(err.keyValue || {}).join(", ")} already exists!`;
    } else if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Session expired, please login again!";
    } else if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token, please login again!";
    } else if (err.expose && err.status < 500) {
        // Errors from express/body-parser (e.g. malformed JSON body)
        statusCode = err.status;
        message = err.message;
    }

    // Unexpected errors: log full details on the server, send a generic message to the client
    if (statusCode === 500) {
        console.error(err);
    }

    res.status(statusCode).send({ success: false, message });
}

module.exports = {
    notFoundHandler,
    errorHandler
}
