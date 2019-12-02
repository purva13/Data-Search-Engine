const FIELD_INFOS = {
    sensorID: {
        friendlyName: 'Sensor ID',
        isRequired: true,
        isSensor: true,
        isSensorSearch: true,
        regex: /[a-zA-Z0-9_\\-]+/,
        error: 'Id field can only contain alphanumerics, - or _',
    },
    model: {
        friendlyName: 'Sensor Model',
        isRequired: true,
        isSensor: true,
        isSensorSearch: true,
        regex: /[a-zA-Z0-9_\\-]+/,
        error: "Model Number field can only contain alphabetics, -, ', or space",
    },
    period: {
        friendlyName: 'Period',
        isRequired: true,
        isSensor: true,
        isSensorSearch: true,
        regex: /[0-9]+/,
        error: 'Period field must be a digit',
    },
    sensorMin: {
        friendlyName: 'Expected Min',
        isRequired: true,
        isSensor: true,
        regex: /\d+/,
        error: 'Minimum field must be a digit',
    },
    sensorMax: {
        friendlyName: 'Expected Max',
        isRequired: true,
        isSensor: true,
        regex: /\d+/,
        error: 'Maximum field must be a digit',
    },
};

function fieldInfos(fields, overrides={}) {
    const infos = {};
    fields.forEach((f) => {
      const v = Object.assign({}, FIELD_INFOS[f] || {});
      infos[f] = Object.assign(v, overrides[f] || {});
    });
    Object.keys(overrides).forEach((f) => {
      infos[f] = infos[f] || overrides[f];
    });
    return infos;
  }
  
  module.exports = {
    FIELD_INFOS,
    fieldInfos,
  };
  