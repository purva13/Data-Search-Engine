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

    app.get('/sensors', doGetSensorList(app));
    app.get('/sensor-types', doGetSensorTypesList(app));
    app.get('/sensor-data/:sensorId', doGetSensorDataList(app));
    app.get(`/sensor-data/:sensorId/:timestamp`, doSensorDataList(app));
    app.get(`/sensors/:id`, doSensorList(app));
    app.get(`/sensor-types/:id`, doSensorTypesList(app));
    app.get(`/sensor-data/:sensorId`, doSensorDataList(app));
    app.post(`/sensors`, doPostSensors(app));
    app.post(`/sensor-types`, doPostSensorTypes(app));
    app.post(`/sensor-data/:id`, doPostSensorData(app));

    //app.use(doErrors()); //must be last; setup for server errors
}
 function doSensorList(app) {
    return errorWrap(async function (req, res) {
        try {
            let results = await app.locals.finder.findSensors(req.params);
            results.data.forEach(function (element) {
                element.self = new URL(getRequestUrl(req) + "/" + element.id);
            });
            if (results.data.length === 0) {
                throw{
                    errors: true,
                    code: 'NOT_FOUND',
                    message: `no data for timestamp ${req.params.id}`,
                };
            } else {
                res.json({"results": results, "self": new URL(getRequestUrl(req))});
            }
        }
        catch(err){
            const mapped = mapError(err);
            const newObj = Object.assign({}, mapped);
            delete newObj.status;
            const newObj1 = {errors:[newObj]};
            res.status(mapped.status).json(newObj1);
        }

    });
}
function doGetSensorList(app) {
    return errorWrap(async function (req, res) {
        try {
            console.log("in get sensor");
            console.log(req.query);
            const q = req.query || {};
            let results = await app.locals.finder.findSensors(q);
            results.data.forEach(function (element) {
                element.self = new URL(getRequestUrl(req) + "/" + element.id);
            });
            if(req.params.id) {
                if (results.data.length === 0) {
                    throw{
                        errors: true,
                        code: 'NOT_FOUND',
                        message: `no data for model ${req.query.model}`,
                    };
                }
            }
            if (results.previousIndex !== -1 && results.previousIndex !== 0) {
                if (req.query._count) {
                    results.previous = new URL((getRequestUrl(req)).split('?')[0] + "?_index=" + `${results.previousIndex}` + "&_count=" + `${req.query._count}`);
                } else {
                    results.previous = new URL((getRequestUrl(req)).split('?')[0] + "?_index=" + `${results.previousIndex}`);
                }
            }
            if (results.nextIndex !== -1) {
                if (req.query._count) {
                    results.next = new URL((getRequestUrl(req)).split('?')[0] + "?_index=" + `${results.nextIndex}` + "&_count=" + `${req.query._count}`);
                } else {
                    results.next = new URL((getRequestUrl(req)).split('?')[0] + "?_index=" + `${results.nextIndex}`);
                }
            }
            results.self = new URL(getRequestUrl(req));
            res.json(results);
        }
        catch(err){
            const mapped = mapError(err);
            const newObj = Object.assign({}, mapped);
            delete newObj.status;
            const newObj1 = {errors:[newObj]};
            res.status(mapped.status).json(newObj1);
        }
    });
}
function doSensorTypesList(app) {
    return errorWrap(async function (req, res) {
        try {
            let results = await app.locals.finder.findSensorTypes(req.params);
            results.data.forEach(function (element) {
                element.self = new URL(getRequestUrl(req) + "/" + element.id);
            });
            if (results.data.length === 0) {
                throw{
                    errors: true,
                    code: 'NOT_FOUND',
                    message: `no data for id ${req.params.id}`,
                };
            } else {
                res.json({"results": results, "self": new URL(getRequestUrl(req))});
            }
        }
        catch(err){
            const mapped = mapError(err);
            const newObj = Object.assign({}, mapped);
            delete newObj.status;
            const newObj1 = {errors:[newObj]};
            res.status(mapped.status).json(newObj1);
        }
    });
}
function doGetSensorTypesList(app) {
    return errorWrap(async function (req, res) {
        try {
            const q = req.query || {};
            let results = await app.locals.finder.findSensorTypes(q);
            results.data.forEach(function (element) {
                element.self = new URL(getRequestUrl(req) + "/" + element.id);
            });
            if (results.data.length === 0) {
                throw{
                    errors: true,
                    code: 'NOT_FOUND',
                    message: `no data for id ${req.query._id}`,
                };
            }
            if (results.previousIndex !== -1 && results.previousIndex !== 0) {
                if (req.query._count) {
                    //results.self = new URL(getRequestUrl(req));
                    results.previous = new URL((getRequestUrl(req)).split('?')[0] + "?_index=" + `${results.previousIndex}` + "&_count=" + `${req.query._count}`);
                    results.next = new URL((getRequestUrl(req)).split('?')[0] + "?_index=" + `${results.nextIndex}` + "&_count=" + `${req.query._count}`);
                } else {
                    //results.self = new URL(getRequestUrl(req));
                    results.previous = new URL((getRequestUrl(req)).split('?')[0] + "?_index=" + `${results.previousIndex}`);
                    results.next = new URL((getRequestUrl(req)).split('?')[0] + "?_index=" + `${results.nextIndex}`);
                }
            }
            if (results.nextIndex !== -1) {
                if (req.query._count) {
                    //results.self = new URL(getRequestUrl(req));
                    results.next = new URL((getRequestUrl(req)).split('?')[0] + "?_index=" + `${results.nextIndex}` + "&_count=" + `${req.query._count}`);
                } else {
                    //results.self = new URL(getRequestUrl(req));
                    results.next = new URL((getRequestUrl(req)).split('?')[0] + "?_index=" + `${results.nextIndex}`);
                }
            }
	    results.self = new URL(getRequestUrl(req));
            res.json(results);
        }
        catch(err){
            const mapped = mapError(err);
            const newObj = Object.assign({}, mapped);
            delete newObj.status;
            const newObj1 = {errors:[newObj]};
            res.status(mapped.status).json(newObj1);
        }
    });
}
function doSensorDataList(app) {
    return errorWrap(async function (req, res) {
        try {
            let results = await app.locals.finder.findSensorData(req.params);
            if (req.params.timestamp) {
                let a = req.params.timestamp
                results.data = results.data.filter(x => x.timestamp == a);
            }
            results.data.forEach(function (element) {
                element.self = new URL(getRequestUrl(req));
            });
            if (results.data.length === 0) {
                throw{
                    errors: true,
                    code: 'NOT_FOUND',
                    message: `no data for timestamp ${req.params.timestamp}`,
                };
            }
            else{
                res.json({"results": results, "self": new URL(getRequestUrl(req))});
            }
        }
        catch(err){
            const mapped = mapError(err);
            const newObj = Object.assign({}, mapped);
            delete newObj.status;
            const newObj1 = {errors:[newObj]};
            res.status(mapped.status).json(newObj1);
        }
    });
}
function doGetSensorDataList(app) {
    return errorWrap(async function (req, res) {
        const q = req.query || {};
        let id = getRequestUrl(req).split('/')[4].split('?')[0];
        q.sensorId = id;
        let results = await app.locals.finder.findSensorData(q);
        results.data.forEach(function (element) {
            element.self = new URL((getRequestUrl(req).split('?')[0]+"/"+element.timestamp));
        });
        results.self = new URL(getRequestUrl(req));

        res.json(results);
    });
}
function doPostSensors(app) {
    return errorWrap(async function (req, res) {
         await app.locals.finder.addSensor(req.body);
        res.sendStatus(CREATED);
    });
}
function doPostSensorTypes(app) {
    return errorWrap(async function (req, res) {
        await app.locals.finder.addSensorType(req.body);
        res.sendStatus(CREATED);
    });
}
function doPostSensorData(app) {
    return errorWrap(async function (req, res) {
        let id = getRequestUrl(req).split('/')[4];
        req.body.sensorId = id;
        await app.locals.finder.addSensorData(req.body);
        res.sendStatus(CREATED);
    });
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

const ERROR_MAP = {
    EXISTS: CONFLICT,
    NOT_FOUND: NOT_FOUND
}

function mapError(err) {
    console.error(err);
    return err.errors ? { status: (ERROR_MAP[err.code] || BAD_REQUEST), code: err.code, message: err.message } : { status: NOT_FOUND, code: 'NOT_FOUND', message: err.toString() };
}
