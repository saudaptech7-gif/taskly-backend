// eslint-disable-next-line no-undef
const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // eslint-disable-next-line no-undef
  await mongoose.connect(process.env.MONGO_URI);

  console.log("MongoDB Connected");
};

// eslint-disable-next-line no-undef
module.exports = connectDB;