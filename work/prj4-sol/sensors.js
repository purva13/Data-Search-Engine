'use strict';

const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const querystring = require('querystring');

const mustache = require('mustache');
const widgetView = require('./widget-view');

const STATIC_DIR = 'statics';
const TEMPLATES_DIR = 'templates';

module.exports = serve;

function serve(port, model, base='') {
  //@TODO
    const app = express();
    app.locals.port = port;
    app.locals.model = model;
    app.locals.base = base;
    process.chdir(__dirname);
    app.use(base, express.static(STATIC_DIR));
    setupTemplates(app, TEMPLATES_DIR);
    setupRoutes(app);
    app.listen(port, function () {
        console.log(`listening on port ${port}`);
    });
}

function setupRoutes(app) {
    app.get('/tst-sensor-types-search.html', getSearchSensorTypeForm(app));
    app.get('/tst-sensor-types-add.html', sensorTypeSearch(app));
    app.post(`/tst-sensor-types-add.html`, bodyParser.urlencoded({extended: false}),getAddSensorType(app));
    app.get('/tst-sensors-search.html', getSearchSensorForm(app));
    app.get('/tst-sensors-add.html', SensorSearch(app));
    app.post(`/tst-sensors-add.html`, bodyParser.urlencoded({extended: false}),getAddSensor(app));

}


//@TODO
/************************** Field Definitions **************************/

const FIELDS_INFO = {
    id: {
        friendlyName: 'Sensor Type ID',
        isSensorType: true,
        isSearch: true,
        isId: true,
        isRequired: true,
        regex: /[a-zA-Z0-9_\\-]+/,
        error: 'Id field can only contain alphanumerics, - or _',
    },
    modelNumber: {
        friendlyName: 'Model Number',
        isSensorType: true,
        isSearch: true,
        isRequired: true,
        regex:  /[a-zA-Z'\s\\-]+/,
        error: "Model Number field can only contain alphabetics, -, ' or space",
    },
    manufacturer: {
        friendlyName: 'Manufacturer',
        isSensorType: true,
        isSearch: true,
        isRequired: true,
        regex: /[a-zA-Z'\s\\-]+/,
        error: "Manufacturer field can only contain alphabetics, -, ' or space",
    },
    quantity: {
        friendlyName: 'Quantity',
        isSensorType: true,
        isRequired: true,
        isSearch: true,
        isSelect: true,
    },
    minimum: {
        friendlyName: 'Minimum',
        isSensorType: true,
        isRequired: true,
        regex: /\d+/,
        error: 'Minimun field must be a digit',
    },
    maximum: {
        friendlyName: 'Maximum',
        isSensorType: true,
        isRequired: true,
        regex: /\d+/,
        error: 'Minimun field must be a digit',
    },
    sensorID: {
        friendlyName: 'Sensor ID',
        isRequired1: true,
        isSensor: true,
        isSensorSearch: true,
        regex: /[a-zA-Z0-9_\\-]+/,
        error: 'Id field can only contain alphanumerics, - or _',
    },
    model: {
        friendlyName: 'Sensor Model',
        isRequired1: true,
        isSensor: true,
        isSensorSearch: true,
        regex: /[a-zA-Z0-9_\\-]+/,
        error: 'Model Number field can only contain alphabetics, -, or space',
    },
    period: {
        friendlyName: 'Period',
        isRequired1: true,
        isSensor: true,
        isSensorSearch: true,
        regex: /[0-9]+/,
        error: 'Period field must be a digit',
    },
    sensorMin: {
        friendlyName: 'Expected Minimum',
        isRequired1: true,
        isSensor: true,
        regex: /\d+/,
        error: 'Minimun field must be a digit',
    },
    sensorMax: {
        friendlyName: 'Expected Maximum',
        isRequired1: true,
        isSensor: true,
        regex: /\d+/,
        error: 'Maximum field must be a digit',
    },
};

const FIELDS =
    Object.keys(FIELDS_INFO).map((n) => Object.assign({name: n}, FIELDS_INFO[n]));

function sensorTypeSearch(app) {
    return async function(req, res) {
        const model = { base: app.locals.base, fields: FIELDS };
        const html = doMustache(app, 'tst-sensor-types-add', model);
        res.send(html);
        };
};

function getAddSensorType(app){
    return async function(req, res) {
        const user = getNonEmptyValues(req.body);
        let errors = validate(user, ['id']);
            
        if(user.quantity==='flow'){
            user.unit='gpm';
        }
        else if(user.quantity==='humidity'){
            user.unit='%';
        }
        else if(user.quantity==='pressure'){
            user.unit='PSI';
        }
        else{
            user.unit='C';
        }

        var min=user.minimum;
        var max=user.maximum;
        user.limits={min,max};
        if (!errors) {
          try {
          await app.locals.model.update('sensor-types', user);
        
        res.redirect(`${app.locals.base}/tst-sensor-types-search.html`);
          }
          catch (err) {
        console.error(err);
        errors = wsErrors(err);
          }
        }
        if (errors) {
          const model = errorModel(app, user, errors);
          const html = doMustache(app, 'tst-sensor-types-add', model);
          res.send(html);
        }
      };
};

function getSearchSensorTypeForm(app) {
    return async function(req, res) {
      const isSubmit = req.query.submit !== undefined;
      let users = [];
      let errors = undefined;
      const search = getNonEmptyValues(req.query);
        errors = validate(search);
        if (Object.keys(search).length == 0) {
      const msg = 'at least one search parameter must be specified';
      errors = Object.assign(errors || {}, { _: msg });
        }
      const q = querystring.stringify(search);
      try {
        users = await app.locals.model.list('sensor-types', search);
        //console.log(users);
        let i = 0;
        while(i<users.data.length){
            users.data[i].minimum = users.data[i].limits.min;
            users.data[i].maximum = users.data[i].limits.max;
            i++;
        }
      }
      catch (err) {
            console.error(err);
        errors = wsErrors(err);
      }
      if (users.length === 0) {
        errors = {_: 'no users found for specified criteria; please retry'};
      }
      let model;
        const fields_SensorType = users.data.map((u) => ({id: u.id, fields: fieldsWithValues(u)}));
        //let nextURL = '/tst-sensor-types-search.html?'+ users.next.split("?")[1];
        //let prevURL = '/tst-sensor-types-search.html?'+ users.previous.split("?")[1];
        model = { base: app.locals.base, users: fields_SensorType, fields: FIELDS , next: '' , previous:''};
      const html = doMustache(app, 'tst-sensor-types-search', model);
      res.send(html);
    };
  };

  function SensorSearch(app) {
    return async function(req, res) {
        const model = { base: app.locals.base, fields: FIELDS };
        const html = doMustache(app, 'tst-sensors-add', model);
        res.send(html);
        };
};

function getAddSensor(app){
    return async function(req, res) {
        const user = getNonEmptyValues(req.body);
        let errors = validate(user, ['sensorID']);
        var min=user.sensorMin;
        var max=user.sensorMax;

        user.expected={min,max};
        user.id = user.sensorID;
        delete user.sensorID;
        if (!errors) {
          try {
            await app.locals.model.update('sensors', user);       
            res.redirect(`${app.locals.base}/tst-sensors-search.html`);
          }
          catch (err) {
            console.error(err);
            errors = wsErrors(err);
          }
        }
        if (errors) {
          const model = errorModel(app, user, errors);
          const html = doMustache(app, 'tst-sensors-add', model);
          res.send(html);
        }
      };
};



function getSearchSensorForm(app) {
    return async function(req, res) {
      let users = [];
      let errors = undefined;
      const search = getNonEmptyValues(req.query);
        errors = validate(search);
        if (Object.keys(search).length == 0) {
      const msg = 'at least one search parameter must be specified';
      errors = Object.assign(errors || {}, { _: msg });
        }
      search.id = search.sensorID;
      delete search.sensorID;
      try {
        users = await app.locals.model.list('sensors', search);
        let i = 0;
        while(i<users.data.length){
            delete users.data[i].minimum;
            delete users.data[i].maximum;
            users.data[i].sensorMin = users.data[i].expected.min;
            users.data[i].sensorMax = users.data[i].expected.max;
            i++;
        }
      }
      
      catch (err) {
            console.error(err);
        errors = wsErrors(err);
      }
      if (users.length === 0) {
        errors = {_: 'no users found for specified criteria; please retry'};
      }
      let model;
        const fields_Sensors = users.data.map((u) => ({id: u.id, fields: fieldsWithValues(u)}));
        model = { base: app.locals.base, users: fields_Sensors, fields: FIELDS };
      const html = doMustache(app, 'tst-sensors-search', model);
      res.send(html);
    };
  };
/************************** Field Utilities ****************************/

/** Return copy of FIELDS with values and errors injected into it. */
function fieldsWithValues(values, errors={}) {
    return FIELDS.map(function (info) {
        const name = info.name;
        const extraInfo = { value: values[name] };
        if (errors[name]) extraInfo.errorMessage = errors[name];
        return Object.assign(extraInfo, info);
    });
}

/** Given map of field values and requires containing list of required
 *  fields, validate values.  Return errors hash or falsy if no errors.
 */
function validate(values, requires=[]) {
    const errors = {};
    requires.forEach(function (name) {
        if (values[name] === undefined) {
            errors[name] =
                `A value for '${FIELDS_INFO[name].friendlyName}' must be provided`;
        }
    });
    for (const name of Object.keys(values)) {
        const fieldInfo = FIELDS_INFO[name];
        const value = values[name];
        if (fieldInfo.regex && !value.match(fieldInfo.regex)) {
            errors[name] = fieldInfo.error;
        }
    }
    return Object.keys(errors).length > 0 && errors;
}

function getNonEmptyValues(values) {
    const out = {};
    Object.keys(values).forEach(function(k) {
        if (FIELDS_INFO[k] !== undefined) {
            const v = values[k];
            if (v && v.trim().length > 0) out[k] = v.trim();
        }
    });
    return out;
}

/** Return a model suitable for mixing into a template */
function errorModel(app, values={}, errors={}) {
    return {
        base: app.locals.base,
        errors: errors._,
        fields: fieldsWithValues(values, errors)
    };
}

/************************ General Utilities ****************************/

/** Decode an error thrown by web services into an errors hash
 *  with a _ key.
 */
function wsErrors(err) {
    const msg = (err.message) ? err.message : 'web service error';
    console.error(msg);
    return { _: [ msg ] };
}

function doMustache(app, templateId, view) {
    const templates = { footer: app.templates.footer };
    return mustache.render(app.templates[templateId], view, templates);
    //return null;
}

function errorPage(app, errors, res) {
    if (!Array.isArray(errors)) errors = [ errors ];
    const html = doMustache(app, 'errors', { errors: errors });
    res.send(html);
}

function isNonEmpty(v) {
    return (v !== undefined) && v.trim().length > 0;
}

function setupTemplates(app) {
    app.templates = {};
    for (let fname of fs.readdirSync(TEMPLATES_DIR)) {
        const m = fname.match(/^([\w\-]+)\.ms$/);
        if (!m) continue;
        try {
            app.templates[m[1]] =
                String(fs.readFileSync(`${TEMPLATES_DIR}/${fname}`));
        }
        catch (e) {
            console.error(`cannot read ${fname}: ${e}`);
            process.exit(1);
        }
    }
}


