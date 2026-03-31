const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(express.json());
app.use(cors());

require('./db/db');
require('dotenv').config();

const intelRouter = require("./routes/intel");
app.use("/", intelRouter);

app.use(express.static(path.join(__dirname, "../front")));

app.listen(3000, () => {
  console.log("server running");
});