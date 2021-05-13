//Require Packages
require("dotenv").config();
const express = require("express");

//Require Routes
const weatherRoute = require("./routes/weather");

//Create App
const app = express();

//Use Json parser for requests
app.use(express.json());

//Use the weather route
app.use(weatherRoute);

//Listen to port
app.listen(3000, () => {
  console.log("app listening on port 3000");
});
