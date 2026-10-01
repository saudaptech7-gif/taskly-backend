/* eslint-disable no-undef */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();

// 1. Buffering ko disable karein taakay 10000ms timeout error na aaye
mongoose.set("bufferCommands", false);

// 2. Serverless Global Database Connection Caching
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in Environment Variables!");
    }

    const opts = {
      serverSelectionTimeoutMS: 5000, // 5s timeout if DB is unreachable
    };

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// 3. Middlewares Setup
app.use(
  cors({
    origin: "http://localhost:5173", // Apne frontend ka exact URL/port yahan set karein
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 4. Auth Middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing!");
      return res.status(500).json({
        success: false,
        message: "Server environment error",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

// 5. Task API Route
app.get("/api/tasks", authMiddleware, async (req, res) => {
  try {
    // DB connect karne ka wait karein query chalane se pehle
    await connectDB();

    const Task = mongoose.model("Task"); // Apne Schema/Model ke hisab se adjust karein
    const tasks = await Task.find({ userId: req.userId });

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Task API Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
});

// Vercel serverless functions ke liye export karein
module.exports = app;

// Local testing ke liye server listener
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}