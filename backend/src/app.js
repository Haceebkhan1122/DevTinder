const path = require("path");
// Load backend/.env no matter which folder the server is started from
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });
const express = require("express");
const connectDB = require("./config/database");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
var cookieParser = require("cookie-parser");

// Security headers (hides X-Powered-By, blocks clickjacking, MIME sniffing etc.)
app.use(helmet());
// Allow only our frontend to call the APIs, with cookies (credentials)
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
// Body bigger than 10kb is rejected with 413
app.use(express.json({ limit: "10kb" }));
// Express 5 leaves req.body undefined when no body is sent
app.use((req, res, next) => {
    req.body = req.body || {};
    next();
});
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");


app.use("/api/v1/auth", authRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/request', requestRouter);
app.use('/api/v1/user', userRouter);

// 404 for unknown routes & central error handler (must be registered after all routes)
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection & server port listen define here
const PORT = process.env.PORT || 7777;
connectDB().then(() => {
    console.log("Database connected successfully!");
    app.listen(PORT, (err) => {
        // Express 5 passes the error here (e.g. EADDRINUSE when port is already in use)
        if (err) {
            console.error(`Server could not start on port ${PORT}:`, err.message);
            process.exit(1);
        }
        console.log(`Server has been running successfully listen on port ${PORT}...`)
    });
}).catch(err => {
    console.error("Database can not be connected!", err.message);
    process.exit(1);
})
