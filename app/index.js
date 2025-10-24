const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV || "dev" });
});

// Only start server if this file is run directly
if (require.main === module) {
  app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
}

module.exports = app;
