// eslint-disable-next-line no-undef
const connectDB = require("../config/db");

const handler = async (req, res) => {
  try {
    await connectDB();

    res.status(200).json({
      message: "MongoDB connection successful",
    });
  } catch (error) {
    console.log("DB ERROR:", error.message);

    res.status(500).json({
      message: "MongoDB connection failed",
      error: error.message,
    });
  }
};

// eslint-disable-next-line no-undef
module.exports = handler;
