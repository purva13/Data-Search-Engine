const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const AppError = require('./app-error');

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

//const base = '/users';
//const SEN = '/sensors';

function serve(port, sensors) {
  //@TODO set up express app, routing and listen
    const app = express();
    app.locals.port = port;
    app.locals.finder = sensors;
    setupRoutes(app);
    const server = app.listen(port, async function() {
        console.log(`PID ${process.pid} listening on port ${port}`);
    });
    return server;

}

module.exports = { serve };

//@TODO routing function, handlers, utility functions
function setupRoutes(app) {
    const base = app.locals.base;
    app.use(cors());
    app.use(bodyParser.json()); //all incoming bodies are JSON

    app.get(`/sensors/:id`, doSensorList(app));
    app.get(`/sensor-types`, doSensorTypesList(app));
    app.get(`/sensor-data/:sensorId`, doSensorDataList(app));
    app.post(`/sensors`, doPostSensors(app));

    //app.use(doErrors()); //must be last; setup for server errors
}
 function doSensorList(app) {
    return errorWrap(async function (req, res) {
        let results = await app.locals.finder.findSensors(req.params);
        console.log(results);
        res.json({"results":results,"self": getRequestUrl(req)});
    });
}
function doSensorTypesList(app) {
    return errorWrap(async function (req, res) {
        let results = await app.locals.finder.findSensorTypes(req.params);
        console.log(results);
        res.json({"results":results,"self": getRequestUrl(req)});
    });
}
function doSensorDataList(app) {
    return errorWrap(async function (req, res) {
        let results = await app.locals.finder.findSensorData(req.params);
        console.log(results);
        res.json({"results":results,"self": getRequestUrl(req)});
    });
}
function doPostSensors(app) {
    return errorWrap(async function (req, res) {
        console.log(req);
         let results = await app.locals.finder.addSensor(req.body);
        // console.log(results);
         res.json("Created");
    });
}
function doGet(app){
    console.log("In DoGet");
    return errorWrap(async function(req, res) {console.log("2")});
}
function doCreate(app){
    console.log("In DoCreate");
    return errorWrap(async function(req, res) {console.log("3")});
}
function doCompletion(app){
    console.log("In DoCompletion");
    return errorWrap(async function(req, res) {console.log("4")});
}
function doErrors(app){
    console.log("In DoErrors");
    return errorWrap(async function(req, res) {console.log("5")});
}
function errorWrap(handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (err) {
            next(err);
        }
    };
}
function getRequestUrl(req) {
    const port = req.app.locals.port;
    return `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
}
