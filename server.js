// eslint-disable-next-line no-undef
const app = require("./app");
// eslint-disable-next-line no-undef
const connectDB = require("./config/db");

// eslint-disable-next-line no-undef
require("dotenv").config();

connectDB()
  .then(() => {
    // eslint-disable-next-line no-undef
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });