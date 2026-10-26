const { rateLimit } = require("express-rate-limit");
const AppError = require("../utils/appError");

// Creates a limiter that allows `limit` requests per IP in `windowMinutes`.
// Over the limit -> 429 through the central error handler (same response format as other errors).
const createLimiter = ({ windowMinutes, limit, message, skipSuccessfulRequests = false }) => rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    skipSuccessfulRequests,
    standardHeaders: "draft-8", // sends RateLimit-* headers so the client knows remaining attempts
    legacyHeaders: false,       // no old X-RateLimit-* headers
    handler: (req, res, next) => next(new AppError(message, 429)),
});

// Login: only failed attempts count, 10 wrong tries per 15 minutes per IP (brute force protection)
const loginLimiter = createLimiter({
    windowMinutes: 15,
    limit: 10,
    skipSuccessfulRequests: true,
    message: "Too many failed login attempts, please try again after 15 minutes!",
});

// Signup: 5 accounts per hour per IP (stops bots creating fake accounts)
const signupLimiter = createLimiter({
    windowMinutes: 60,
    limit: 5,
    message: "Too many accounts created from this IP, please try again after an hour!",
});

// Forget password: 5 requests per 15 minutes per IP
const passwordLimiter = createLimiter({
    windowMinutes: 15,
    limit: 5,
    message: "Too many password reset attempts, please try again after 15 minutes!",
});

// Reset password: separate counter from forgot password, 10 attempts per 15 minutes
// (a few weak-password errors shouldn't block the user from resetting)
const resetPasswordLimiter = createLimiter({
    windowMinutes: 15,
    limit: 10,
    message: "Too many reset password attempts, please try again after 15 minutes!",
});

module.exports = {
    loginLimiter,
    signupLimiter,
    passwordLimiter,
    resetPasswordLimiter
}
