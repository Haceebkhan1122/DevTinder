const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const connectionRequestSchema = new mongoose.Schema({

    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User" // reference to the user collection.
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User" // reference to the user collection.
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignore", "interested", "accepted", "rejected"],
            message: `{VALUE} is incorrect status type`
        }
    }
},
    {
        timestamps: true,
    });

// One request per (sender, receiver) pair. Unique, so even two requests at the same moment
// (double click) can't create a duplicate: the second insert fails with error code 11000.
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

connectionRequestSchema.pre('save', function () {
    let connectionRequest = this;
    // Check if same loggedin user try to send connection request to itself.
    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new AppError("Can't send request to yourself!", 400);
    }
});

const ConnectionRequestModel = new mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = {
    ConnectionRequestModel
}

