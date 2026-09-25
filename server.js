// eslint-disable-next-line no-undef
const app = require("./app");
// eslint-disable-next-line no-undef
const connectDB = require("./config/db");

// eslint-disable-next-line no-undef
require("dotenv").config();

connectDB()
  .then(() => {
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });
