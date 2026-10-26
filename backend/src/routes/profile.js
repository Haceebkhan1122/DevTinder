const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const User = require('../models/user');
const AppError = require("../utils/appError");
const { USER_SAFE_DATA } = require('../utils/constants');

// Get User Profile API
profileRouter.get("/view", userAuth, async (req, res) => {
    const user = req.user;

    const filterData = await User.find({ _id: user._id }).select(USER_SAFE_DATA);

    res.status(200).send({ data: filterData });
});

// Update Profile Data API
profileRouter.patch("/edit", userAuth, async (req, res) => {
    if (!validateEditProfileData(req)) {
        throw new AppError("Some Field is not allowed for edit!", 400);
    }

    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key]);
    await loggedInUser.save();
    res.status(200).send({ Message: loggedInUser.firstName + ", your profile has been updated successfully!", data: loggedInUser });
});

module.exports = profileRouter;
