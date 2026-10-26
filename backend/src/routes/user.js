const express = require('express');
const { userAuth } = require('../middlewares/auth');
const userRouter = express.Router();
const { ConnectionRequestModel } = require("../models/connectionRequest");
const User = require('../models/user');
const { USER_SAFE_DATA } = require('../utils/constants');

// Errors are thrown and handled by the central error handler (middlewares/errorHandler.js)

// Get all incoming requests of logged in user
userRouter.get("/requests/received", userAuth, async (req, res) => {
    // Find/Filter connection request of this user which has interested status.
    const findConnectionRequest = await ConnectionRequestModel.find({
        status: "interested",
        toUserId: req.user._id
    }).populate("fromUserId", USER_SAFE_DATA).sort({ createdAt: -1 });

    // fromUserId is null when the sender deleted their account -> skip those requests
    const validRequests = findConnectionRequest.filter((row) => row.fromUserId);

    res.status(200).send({ message: "Get all received request successfully!", data: validRequests });
});

// Get all connections of logged in user
userRouter.get("/connections", userAuth, async (req, res) => {
    const user = req.user;
    // Find/Filter connection request of this user which has accepted status.
    const findConnectionRequest = await ConnectionRequestModel.find({
        status: "accepted",
        $or: [
            { fromUserId: user._id },
            { toUserId: user._id }
        ]
    }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA).sort({ updatedAt: -1 });

    const wantedData = findConnectionRequest
        // populate gives null when that user deleted their account -> skip, instead of crashing the whole list
        .filter((row) => row.fromUserId && row.toUserId)
        // return the OTHER person of each connection
        .map((row) => (row.fromUserId._id.equals(user._id) ? row.toUserId : row.fromUserId));

    res.status(200).send({ message: "Connections fetch successfully!", data: wantedData });
});

// Get all feed
userRouter.get("/feed", userAuth, async (req, res) => {
    const user = req.user;

    // page >= 1 and 1 <= limit <= 50 (negative values would make MongoDB throw)
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    let limit = Math.max(parseInt(req.query.limit) || 10, 1);
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // Only the ids are needed (no populate), so a deleted user can't make this crash
    const findConnectionRequest = await ConnectionRequestModel.find({
        $or: [
            { fromUserId: user._id },
            { toUserId: user._id }
        ]
    }).select("fromUserId toUserId");

    // Hide myself + everyone I already have a request with (sent or received, any status)
    const hideUsersFromFeed = new Set([user._id.toString()]);
    findConnectionRequest.forEach((row) => {
        hideUsersFromFeed.add(row.fromUserId.toString());
        hideUsersFromFeed.add(row.toUserId.toString());
    });

    // sort by _id: without a fixed order MongoDB may return users in a different order each time,
    // and skip/limit pages could repeat or miss users
    const users = await User.find({ _id: { $nin: Array.from(hideUsersFromFeed) } })
        .select(USER_SAFE_DATA)
        .sort({ _id: 1 })
        .skip(skip)
        .limit(limit);

    res.status(200).send(users);
});

module.exports = userRouter;
