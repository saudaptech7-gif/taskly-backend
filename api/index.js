/* eslint-disable no-undef */
const express = require("express");
const connectDB = require("./db"); // Path to your db helper
const authMiddleware = require("./authMiddleware");
// eslint-disable-next-line no-undef
const Task = require("./models/Task");

const app = express();

app.get("/api/tasks", authMiddleware, async (req, res) => {
  try {
    // 1. Always ensure DB connection first in serverless
    await connectDB();

    // 2. Query your data
    const tasks = await Task.find({ userId: req.userId });

    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.error("Task API Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// eslint-disable-next-line no-undef
module.exports = app;