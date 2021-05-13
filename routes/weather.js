//Require express
const express = require("express");
//Create router
const router = express.Router();

//Require weather controller
const weatherController = require("../controllers/weatherController");

//Add a route for the HTTP method GET
router.get("/getWeather/:city", weatherController.getWeather);

//Export route
module.exports = router;
