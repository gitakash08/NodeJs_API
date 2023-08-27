
//#region Pakage
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const parseJson = require('parse-json');
const path = require('path');
const dotenv = require("dotenv");
const cors = require("cors");
const h3 = require("h3-js");
const jwt = require("jsonwebtoken");
const mssql = require("mssql");
const request = require('request');
const admin = require("firebase-admin");
//#endregion
//#region Config File .env
let result = dotenv.config();
if (result.error) {
  throw result.error;
}
//#endregion

//#region cors
const app = express();
app.use(cors());
app.options('*', cors());
//#endregion

//#region connect to database
const config = {
  port: parseInt(process.env.DB_PORT, 10),
  server: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB,
  stream: false,
  options: {
    trustedConnection: true,
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: true,

  },
}

mssql.connect(config).then(pool => {
  if (pool.connecting) {
    console.log('Connecting to the database...')
  }
  if (pool.connected) {
    console.log('Connected to SQL Server')
  }
})


//#region Logs Create
const opts = {
  errorEventName: 'error',
  logDirectory: './logs', // NOTE: folder must exist and be writable...
  fileNamePattern: '<DATE>.log',
  dateFormat: 'YYYY-MM-DD'
};

const log = require('simple-node-logger').createRollingFileLogger(opts);
//#endregion

//#region Global Varable
let serviceAccount = require("./concorgeofencing-52818-firebase-adminsdk-99ttn-fc520c7f86.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
//#endregion

//#region Global Varable
global.admin = admin;
global.db = mssql;
global.config = config;
//global.jwt = jwt;
global.log = log;
global.request = request;
//#endregion

//#region 
// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: "2048mb" }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "2048mb", extended: true }));
app.use(bodyParser.json());
//app.use(express.static('public')); 
//#endregion

//#region get routing use this function End
const {
  getApi,
  sendOtp,
  ConfrimOtp,
  Geolocation,
  GeoEmployee,
  GeoOfficeRreport,
  EmpCheckInCheckOutReport,
  EmpliveGeofence,
  EmplLoginReport,
  EmpLogOut,
  geofenceReplayTracking,
  getEmployeefromDB,
  getGeofenceViolationReport,
  UpdateKeyUser,
  geoNotifi,
  loginAdmin,
  devationReportApi,
  getOutsideInside,
  getOnlineOffline,
  getDashboardTable,
  getMobileAccessable,
  getPolarChartData,
  getPolarDemotesting,
  getBarchartData,
  getIdleReportSummary,
  getMobileAccessableReport,
  getGeofenceUserData,
  getWarnedNotWarnedUserCount,
  getTerminal,
  getNotGeofenceUserData,
  getNotWarnedReport,
  getWarnedReport,
  getRoleBasedLogin,
  getDataForUserManagement
} = require('./controller/gisApi');
//#endregion

app.get('/', getApi);
app.get('/ccil/Api/loginAdmin', loginAdmin);
app.get('/ccil/Api/demotesting', getPolarDemotesting);
app.post('/ccil/Api/loginAdmin', loginAdmin);
app.get('/ccil/Api/getOutsideInside', getOutsideInside);
app.get('/ccil/Api/getOnlineOffline', getOnlineOffline);
app.get('/ccil/Api/getDashboardTable', getDashboardTable);
app.get('/ccil/Api/sendOtp', sendOtp);
app.get('/ccil/Api/geoNotifi', geoNotifi);
app.get('/ccil/Api/UpdateKeyUser', UpdateKeyUser);
app.get('/ccil/Api/ConfrimOtp', ConfrimOtp);
app.get('/ccil/Api/Geolocation', Geolocation);
app.get('/ccil/Api/GeoEmployee', GeoEmployee);
app.get('/ccil/Api/GeoOfficeRreport', GeoOfficeRreport);
app.get('/ccil/Api/EmpCheckInCheckOutReport', EmpCheckInCheckOutReport);
app.get('/ccil/Api/EmpliveGeofence', EmpliveGeofence);
app.get('/ccil/Api/EmplLoginReport', EmplLoginReport);
app.get('/ccil/Api/EmpLogOut', EmpLogOut);
app.get('/ccil/Api/geofenceReplayTracking', geofenceReplayTracking);
app.get('/ccil/Api/getEmployeefromDB', getEmployeefromDB);
app.get('/ccil/Api/getGeofenceViolationReport', getGeofenceViolationReport);
app.get('/ccil/Api/devationReportApi', devationReportApi);
app.get('/ccil/Api/getMobileAccessable', getMobileAccessable);
app.get('/ccil/Api/getPolarChartData', getPolarChartData);
app.get('/ccil/Api/getBarchartData', getBarchartData);
app.get('/ccil/Api/getIdleReportSummary', getIdleReportSummary);
app.get('/ccil/Api/getMobileAccessableReport', getMobileAccessableReport);
app.get('/ccil/Api/getGeofenceUserData', getGeofenceUserData);
app.get('/ccil/Api/getWarnedNotWarnedUserCount', getWarnedNotWarnedUserCount);
app.get('/ccil/Api/getTerminal', getTerminal);
app.get('/ccil/Api/getNotGeofenceUserData', getNotGeofenceUserData);
app.get('/ccil/Api/getNotWarnedReport', getNotWarnedReport);
app.get('/ccil/Api/getWarnedReport', getWarnedReport);
app.get('/ccil/Api/getRoleBasedLogin', getRoleBasedLogin);
app.get('/ccil/Api/getDataForUserManagement', getDataForUserManagement);

app.get('/ccil/Api/locations', function (request, response) {
  console.log('Headers:\n', request.headers);
  console.log('Locations:\n', JSON.stringify(request.body));
  log.info("Background Data log -  [" + JSON.stringify(request.body.user_id) + "]")
  if (request.body.location.provider !== undefined) {
    log.info("Background Data log 33 -  [" + JSON.stringify(request.body.location.provider) + "]")
    log.info("Background Mobile -  [" + JSON.stringify(request.body.mobile) + "]")
  }
  console.log('------------------------------');
  response.sendStatus(200);
});

app.post('/ccil/Api/locations', function (request, response) {
  console.log('Headers:\n', request.headers);
  if (request.body.location.provider !== undefined) {

    log.info("Background Data log 33 -  [" + request.body.location.timestamp + "]")
    log.info("Background Mobile -  [" + request.body.mobile + "]")
    let query = "exec uspInsertProviderChange @Mobile='" + request.body.mobile + "', @CreatedOn='" + request.body.location.timestamp + "',@GPS_Status='" + request.body.location.provider.gps + "', @AirplaneMode='" + request.body.location.provider.airplane + "', @Internet='" + request.body.location.provider.network + "', @Status='" + request.body.location.provider.status + "', @Bettery='" + request.body.location.battery.level + "', @Latitude='" + request.body.location.coords.latitude + "', @Longitude='" + request.body.location.coords.longitude + "'";
    log.info("SIP2_GIS_SERVICE. [" + query + "]");
    db.connect(config, function (err) {
      if (err) console.log(err);
      let requestDB = new db.Request();
      requestDB.query(query, (err, result) => {
        if (err) {
          log.info("SIP2_GIS_SERVICE. [" + err + "], [Something went wrong. Please try again after sometime]");
          res.sendStatus(500);
        }
        if (result) {
          log.info("SIP2_GIS_SERVICE.[" + mobile + "] [" + latitude + "] [" + longitude + "], [Live Location]");
          res.sendStatus(200);
        }
        else {
          log.info("SIP2_GIS_SERVICE. ['Sorry Your location is not added.]");
          res.sendStatus(200);
        }
      });
    });
  }
  console.log('------------------------------');
  response.sendStatus(200);
});
//#endregion

//#region Server running
const port = process.env.PORT;
// set the app to listen on the port
//app.listen(port, "0.0.0.0");

// set the app to listen on the port
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
//#endregion
