//External imports
const axios = require("axios");
//Internal imports
const logger = require("../helpers/logger");
const db = require("../helpers/database");
const cypher = require("../helpers/cypher");

//Hoy many miliseconds to wait until we reach from API
const {milisecondsOld} = require('../constants');

/**
 * getWeather API endpoint. Reaches for actual weather from any city.
 *
 * @param {Object} req -> Request Data. Params: city
 * @param {Object} res
 * @param {Function} next
 * @returns Weather data from a country
 */
exports.getWeather = async (req, res, next) => {
  const { city } = req.params;
  try {
    //Retrieve the city from the request params

    //Query DB to check if we have data already for that city
    const cityQuery = await db.query(
      `SELECT city, temperature, windSpeed, humidity, pressure, timestamp FROM weather WHERE city='${city}'`
    );

    //Check if the query is empty or if the timestamp is old enough to fetch again from DB
    if (cityQuery.length === 0 
        || cityQuery[0].timestamp < Date.now() - milisecondsOld){
      let weather = await fetchNewWeather(city);
      logger.info("Fetching API");
      //respond with status code 200 and weather data
      res.status(200).json(weather);
    } else {
      //If data is not old enough, return the DB data
      //We add a new field to know it was retireved from Database
      cityQuery[0].fetchedFrom = "Database";
      logger.info("Fetched from Database");
      //respond with status code 200 and weather data
      res.status(200).json(cityQuery[0]);
    }
  } catch (error) {  
    //If there is no city with that name in the API, return status 404 - Not found
    logger.error(error);
    res.status(404).json({ message: "City not found", status: 404 });
  }
};

/**Function to fetch OpenWeather API
 *
 * @params {string} city -> City to fetch data
 *
 * @returns weather data from that city
 */
fetchNewWeather = (city) => {
  return new Promise((resolve, reject) => {
    //Decrypt the APIKey
    let APIKey = cypher.decrypt(process.env.APIKey, process.env.hashIV);

    //Make a request to Openweather API sending city and APIKey in URL
    axios
      .get(
        `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`
      )
      .then((response) => {
        //Check the response data, to know if it succeded
        if (response.data.cod === 404) {
          //If the city is not found, we reject the promise
          reject("City Not Found");
        }
        //Get all data from the response
        let { temp, pressure, humidity } = response.data.main;
        let windSpeed = response.data.wind.speed;
        let cityName = response.data.name;
        let timestamp = Date.now();

        //Insert or Update DB record
        db.query(
          `REPLACE INTO weather (city, temperature, windSpeed, humidity, pressure, timestamp) 
                VALUES('${cityName}',${temp}, ${windSpeed}, ${humidity}, ${pressure}, ${timestamp})`
        )
          .then((data) => {
            //TODO: Check data for errors
            //After we inserted data, resolve with an object with weather data
            resolve({
              city: cityName,
              temperature: temp,
              windSpeed: windSpeed,
              humidity: humidity,
              pressure: pressure,
              timestamp: timestamp,
              fetchedFrom: "API",
            });
          })
          .catch((err) => {
            //If there was an error making the insertion, we log it and then reject it
            logger.error(err);
            reject(err);
          });
      })
      .catch((err) => {
        //If there was an error fetching the API, we log it and reject it
        logger.error(err.response);
        reject(err.response);
      });
  });
};
