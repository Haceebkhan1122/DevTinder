const express = require('express');
const authRouter = express.Router();

const { validateSignUpData, validateLoginData, validateForgotPasswordData, validateResetPasswordData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const AppError = require("../utils/appError");
const { loginLimiter, signupLimiter, passwordLimiter, resetPasswordLimiter } = require("../middlewares/rateLimiter");
const sendEmail = require("../utils/email");
const { TOKEN_COOKIE_OPTIONS, TOKEN_EXPIRY_MS } = require("../utils/constants");

// Errors are thrown and handled by the central error handler (middlewares/errorHandler.js)

// Signup API
authRouter.post('/signup', signupLimiter, async (req, res) => {
    const { firstName, lastName, emailId, password } = req.body
    // Fields validations are here 
    validateSignUpData(req);

    // Ecription of password to store in DB
    const passwordHash = await bcrypt.hash(password, 10);

    // Creating a new instance of the user model / Creating a new user with the given data using new keyword
    const user = new User({
        firstName,
        lastName,
        emailId,
        password: passwordHash,
    });

    // Save the User. (Duplicate email -> 409 from error handler)
    await user.save();
    res.status(201).send({ message: "User added successfully!" });
});

// Login API
authRouter.post('/login', loginLimiter, async (req, res) => {
    const { emailId, password } = req.body;

    // Fields validations are here 
    validateLoginData(req);

    // Find user and try to loggedin
    const user = await User.findOne({ emailId });

    if (!user) {
        throw new AppError("Invalid Credentials!", 401);
    }

    // Check the password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
        throw new AppError("Incorrect Credentials!", 401);
    }

    // Create JWT token (cookie expiry matches JWT expiry of 7 days)
    const token = await user.getJWT();
    res.cookie("token", token, {
        ...TOKEN_COOKIE_OPTIONS,
        maxAge: TOKEN_EXPIRY_MS,
    });
    res.status(200).send({ message: "Logged In successfully!", token: token })
});

// Logout API
authRouter.post('/logout', async (req, res) => {
    // Options must match the ones used in login, otherwise the browser won't remove the cookie
    res.clearCookie("token", TOKEN_COOKIE_OPTIONS);
    res.status(200).send("User Logout Successfully!");
});

// Forgot Password API (user is logged out, so it lives in authRouter)
authRouter.post('/forgot-password', passwordLimiter, async (req, res) => {
    validateForgotPasswordData(req);

    const emailId = req.body.emailId.trim().toLowerCase();

    // Same response whether the email exists or not, so nobody can find out which emails are registered
    const responseMessage = "If an account with this email exists, a password reset link has been sent!";

    const user = await User.findOne({ emailId });
    if (!user) {
        return res.status(200).send({ message: responseMessage });
    }

    // Raw token goes in the email, only its hash is saved in DB
    const resetToken = user.createPasswordResetToken();
    // Only the reset fields changed, so skip validating the whole document
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email is sent in the background (not awaited): the response time is then almost the same
    // for registered and unregistered emails, so timing can't reveal which emails exist.
    sendEmail({
        to: user.emailId,
        subject: "DevTinder - Reset your password",
        text: `Hi ${user.firstName},\n\nClick the link below to reset your password. It is valid for 15 minutes.\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
        html: `<p>Hi ${user.firstName},</p><p>Please click the link below to reset your password. It is valid for <b>15 minutes</b>.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
    }).catch(async (err) => {
        // Email failed: remove the token so no valid token is left in DB that nobody received
        console.error("Reset password email failed:", err.message);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false }).catch((saveErr) => console.error(saveErr.message));
    });

    res.status(200).send({ message: responseMessage });
});

// Reset Password API (user is logged out, so it lives in authRouter)
authRouter.post('/reset-password/:token', resetPasswordLimiter, async (req, res) => {
    validateResetPasswordData(req);

    const hashedToken = User.hashResetToken(req.params.token);
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    // Find the user by token AND set the new password + remove the token in ONE atomic operation.
    // So two requests with the same link can't both succeed, and the link works only once.
    // (findOneAndUpdate doesn't run schema validators, so old invalid fields can't block the reset)
    const user = await User.findOneAndUpdate(
        {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },  // link not expired yet
        },
        {
            $set: {
                password: passwordHash,
                // 1 second back because JWT "iat" is in whole seconds: a login right after the reset
                // would otherwise get an iat slightly smaller than this time and be rejected
                passwordChangedAt: new Date(Date.now() - 1000),
            },
            $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
        }
    );

    // Token is random 256-bit, nobody can guess it, so it's safe to tell the truth here
    if (!user) {
        throw new AppError("Reset link is invalid or has expired!", 400);
    }

    // Let the real owner know, in case someone else changed the password (background, like forgot password)
    sendEmail({
        to: user.emailId,
        subject: "DevTinder - Your password has been changed",
        text: `Hi ${user.firstName},\n\nYour DevTinder password was just changed. All your old sessions have been logged out.\n\nIf you did not do this, please reset your password immediately and contact support.`,
        html: `<p>Hi ${user.firstName},</p><p>Your DevTinder password was just changed. All your old sessions have been logged out.</p><p>If you did not do this, please reset your password immediately and contact support.</p>`,
    }).catch((err) => console.error("Password changed email failed:", err.message));

    // Old token cookie (if any) is no longer valid, remove it from this browser too
    res.clearCookie("token", TOKEN_COOKIE_OPTIONS);
    res.status(200).send({ message: "Password reset successfully, please login with your new password!" });
});

module.exports = authRouter;
