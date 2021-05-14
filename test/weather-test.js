//Config dotenv to be able to read env variables
require("dotenv").config();
const expect = require("chai").expect;
const db = require("../helpers/database");
const weatherController = require("../controllers/weatherController");

const milisecondsOld = 20000;

describe("Weather Conroller", () => {
    
  after(() => {
    //Close db session after all tests are done
    db.end();
  });

  it("Should return 'Fetched From API'", (done) => {
    setTimeout(() => {
      const req = {
        params: {
          city: "London",
        },
      };
      const res = {
        statusCode: 500,
        data: null,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.data = data;
          return this;
        },
      };

      weatherController
        .getWeather(req, res, () => {})
        .then(() => {
          expect(res.statusCode).to.equal(200);
          expect(res.data).to.have.property("fetchedFrom").to.equal("API");
          done();
        })
        .catch((err) => console.log(err));
    }, milisecondsOld);
  });

  it("Should return 'Fetched from database'", (done) => {
    const req = {
      params: {
        city: "Guadalajara",
      },
    };

    const res = {
      statusCode: 500,
      data: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    };

    weatherController
      .getWeather(req, res, () => {})
      .then(() => {
        res.statusCode = 500;
        res.data = null;
        return weatherController.getWeather(req, res, () => {});
      })
      .then(() => {
        expect(res.statusCode).to.equal(200);
        expect(res.data).to.have.property("fetchedFrom").to.equal("Database");
        done();
      })
      .catch((err) => console.log(err));
  });

  it("Should return code 404 and essage 'Country not founnd", (done) => {
    const req = {
      params: {
        city: "xyz",
      },
    };

    const res = {
      statusCode: 500,
      data: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    };

    weatherController
      .getWeather(req, res, () => {})
      .then(() => {
        expect(res.statusCode).to.equal(404);
        expect(res.data)
          .to.have.property("message")
          .to.equal("Country not found");
        done();
      })
      .catch((err) => console.log(err));
  });
});
