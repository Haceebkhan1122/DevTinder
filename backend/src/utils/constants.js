const USER_SAFE_DATA = ["firstName", "lastName", "photoUrl", "age", "gender", "about", "skills"];

// Same as JWT expiry (7d) in models/user.js
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

// Password reset link is valid for 15 minutes
const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000;

// Options for the auth "token" cookie. Logout must clear the cookie with the same options.
const TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,                                 // JavaScript (document.cookie) can't read it -> token safe from XSS
    secure: process.env.NODE_ENV === "production",  // only sent over HTTPS in production
    sameSite: "strict",                             // not sent with requests coming from other sites -> CSRF protection
};

module.exports = {
    USER_SAFE_DATA,
    TOKEN_EXPIRY_MS,
    TOKEN_COOKIE_OPTIONS,
    RESET_TOKEN_EXPIRY_MS
}
