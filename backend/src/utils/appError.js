// Custom error for expected (operational) errors with an HTTP status code.
class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
    }
}

module.exports = AppError;
