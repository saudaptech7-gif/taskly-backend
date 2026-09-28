// eslint-disable-next-line no-undef
const app = require("../app");
// eslint-disable-next-line no-undef
const connectDB = require("../config/db");

const handler = async (req, res) => {
  await connectDB();
  return app(req, res);
};

// eslint-disable-next-line no-undef
module.exports = handler;