// eslint-disable-next-line no-undef
const mongoose = require("mongoose");

// eslint-disable-next-line no-undef
let cached = global.mongoose;

if (!cached) {
  // eslint-disable-next-line no-undef
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Prevents 10000ms buffering timeouts
      serverSelectionTimeoutMS: 5000,
    };

    // eslint-disable-next-line no-undef
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

// eslint-disable-next-line no-undef
module.exports = connectDB;