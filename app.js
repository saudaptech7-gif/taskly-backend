// eslint-disable-next-line no-undef
const express = require("express");
// eslint-disable-next-line no-undef
const cors = require("cors");
// eslint-disable-next-line no-undef
const bcrypt = require("bcryptjs");
// eslint-disable-next-line no-undef
const jwt = require("jsonwebtoken");
// eslint-disable-next-line no-undef
const cookieParser = require("cookie-parser");

// eslint-disable-next-line no-undef
require("dotenv").config();

// eslint-disable-next-line no-undef
const User = require("./models/User");
// eslint-disable-next-line no-undef
const Task = require("./models/Task");
// eslint-disable-next-line no-undef
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// eslint-disable-next-line no-undef
const isProduction = process.env.NODE_ENV === "production";

// ==================== MIDDLEWARE ====================

app.use(
  cors({
    // eslint-disable-next-line no-undef
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// ==================== HOME ====================

app.get("/", (req, res) => {
  res.send("Taskly Backend is Running");
});

// ==================== SIGNUP ====================

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==================== LOGIN ====================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      // eslint-disable-next-line no-undef
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==================== CHECK AUTH ====================

app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==================== LOGOUT ====================

app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.json({
    message: "Logout successful",
  });
});

// ==================== ADD TASK ====================

app.post("/tasks", authMiddleware, async (req, res) => {
  try {
    const { text, description } = req.body;

    if (!text || !description) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const task = await Task.create({
      userId: req.userId,
      text,
      description,
      completed: false,
    });

    res.status(201).json({
      message: "Task added successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==================== GET TASKS ====================

app.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.userId,
    }).sort({
      createdAt: -1,
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==================== UPDATE TASK ====================

app.put("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const { text, description, completed } = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      {
        text,
        description,
        completed,
      },
      {
        new: true,
      },
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==================== DELETE TASK ====================

app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// eslint-disable-next-line no-undef
module.exports = app;