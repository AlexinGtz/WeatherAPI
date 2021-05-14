const mysql = require("mysql");
const logger = require("../helpers/logger");

//Create a connection with mysql database
const connection = mysql.createConnection({
  host: process.env.dbHost,
  user: process.env.dbUser,
  password: process.env.dbPassword,
  database: process.env.dbDatabase,
});

/**
 * Function to query MySQL Database
 * 
 * @param {string} query -> Query to execute 
 * @returns -> Data fetched from DB
 */
exports.query = (query) => {
  return new Promise((resolve, reject) => {
    try {
      //Log the query to be executed
      logger.info(`QUERY: ${query}`);
      //Create a query with the connection
      connection.query(query, function (error, results, fields) {
        //If there was an error with the query, reject it
        if (error) reject(error);
        //This is because the query return some mysql rows, so I stringify and then parse to make a normal Object
        //If it is null, it doesn't work to parse, that's the resason for the ternary operator
        results = results ? JSON.parse(JSON.stringify(results)) : results;
        //return the query results
        resolve(results);
      });
    } catch (err) {
      console.log(err);
      //Log error if there is any
      logger.error("Error making Query");
      //reject the error
      reject(err);
    }
  });
};

//end connection with the database
exports.end = () => {
  return connection.end();
};