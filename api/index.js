// eslint-disable-next-line no-undef
const app = require("../app");
// eslint-disable-next-line no-undef
const connectDB = require("../config/db");

const handler = async (req, res) => {
  try {
    console.log("API: Connecting to MongoDB...");

    await connectDB();

    console.log("API: MongoDB connected, running app...");

    return app(req, res);
  } catch (error) {
    console.log("API ERROR:", error.message);

    return res.status(500).json({
      message: "API connection failed",
      error: error.message,
    });
  }
};

// eslint-disable-next-line no-undef
module.exports = handler;