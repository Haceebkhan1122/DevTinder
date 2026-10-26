const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateObjectId } = require("../middlewares/validateObjectId");
const { ConnectionRequestModel } = require("../models/connectionRequest");
const User = require('../models/user');
const AppError = require("../utils/appError");

// Errors are thrown and handled by the central error handler (middlewares/errorHandler.js)

// Send Connections API
requestRouter.post("/send/:status/:toUserId", userAuth, validateObjectId("toUserId"), async (req, res) => {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const actionStatus = req.params.status;

    // Allowed Status.
    const AllowedStatus = ["ignore", "interested"];
    if (!AllowedStatus.includes(actionStatus)) {
        throw new AppError("Invalid status type!", 400);
    }

    // Find Receiver User in our DB by toUserId.
    const findToUserIdInDb = await User.findById(toUserId);
    if (!findToUserIdInDb) {
        throw new AppError("User does not exist in our DB!", 404);
    }

    // Find existing connection request.
    const findExistingConnectionRequest = await ConnectionRequestModel.findOne({
        $or: [
            { toUserId, fromUserId },
            { fromUserId: toUserId, toUserId: fromUserId },
        ]
    });

    if (findExistingConnectionRequest) {
        throw new AppError("Connection request already exist!", 409);
    }

    // Creating a new instance of the connection request model / Creating a new connection request with the given data using new keyword
    const connectionRequest = new ConnectionRequestModel({
        fromUserId,
        toUserId,
        status: actionStatus
    });

    // Save the Connection Request.
    // If a duplicate slipped past the check above (two requests at the same time), the unique index rejects it.
    let data;
    try {
        data = await connectionRequest.save();
    } catch (err) {
        if (err.code === 11000) {
            throw new AppError("Connection request already exist!", 409);
        }
        throw err;
    }
    res.status(201).json({
        message: `${req.user.firstName}! you just sent ${actionStatus} to ${findToUserIdInDb.firstName}`,
        data
    })
});

// Review Connections API
requestRouter.post("/review/:status/:requestId", userAuth, validateObjectId("requestId"), async (req, res) => {
    const requestId = req.params.requestId;
    const actionStatus = req.params.status;

    // Allowed Status.
    const AllowedStatus = ["accepted", "rejected"];
    if (!AllowedStatus.includes(actionStatus)) {
        throw new AppError("Invalid status type!", 400);
    }

    // Find/Filter connection request with valid request id & status must be interested.
    const findConnectionRequest = await ConnectionRequestModel.findOne({ _id: requestId, toUserId: req.user._id, status: "interested" });
    if (!findConnectionRequest) {
        throw new AppError("Connection Request does not exist!", 404);
    }

    // Then update the status of that connection request and find sender user in db and attached that name in response message!
    findConnectionRequest.status = actionStatus;
    const findRequestSenderUser = await User.findById(findConnectionRequest.fromUserId);

    // Save the Connection Request.
    const data = await findConnectionRequest.save();
    res.json({
        message: `${req.user.firstName}! you just sent ${actionStatus} to ${findRequestSenderUser.firstName}!`,
        data
    });
});

module.exports = requestRouter;
