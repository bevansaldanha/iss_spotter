const request = require("request");


const fetchMyIP = function(callback) {
  request("https://api.ipify.org?format=json", function(error, response, body) {
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const strIP = JSON.parse(body);
    const userIP = strIP.ip;
    callback(error, userIP);
  });
};

const fetchCoordsByIP = function(ip, callback) {



  request(`https://ipwho.is/${ip}`, function(error, response, body) {
    if (error) {
      callback(error, null);
      return;
    }


    if (JSON.parse(body).success) {
      const latitude = JSON.parse(body).latitude;
      const longitude = JSON.parse(body).longitude;

      callback(null,{ latitude, longitude });
      return;
    }
    const msg = `IP is invalid`;
    callback(Error(msg), null );
    return;
  });

};
const fetchISSFlyOverTimes = function(coords, callback) {

  request(`http://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {

    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passingTime = JSON.parse(body).response;


    callback(null, (passingTime));

  });
};
const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, userIP) => {
    if (error) {
      return callback(error, null);
    }
    fetchCoordsByIP(userIP, (error, location) => {
      if (error) {
        return callback(error, null);
      }
      fetchISSFlyOverTimes(location, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null,nextPasses);
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation };