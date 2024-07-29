"use strict";

const app = require("./app");
require("dotenv").config();
const PORT = process.env.PORT

app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
