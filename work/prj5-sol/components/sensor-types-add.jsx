const React = require('react');

const {FIELD_INFOS, fieldInfos} = require('../sensor-type-add');
const FormComponent = require('./form-component.jsx');

class  SensorTypesAdd extends React.Component {
  constructor(props) {
    super(props);
    const extraInfos = {
      submit: {
        type: 'submit',
        value: 'Create',
      },
    };
    const infos = fieldInfos(Object.keys(FIELD_INFOS), extraInfos);
    this.doUpdate = this.doUpdate.bind(this);
    this.form = ( <FormComponent infos={infos} onSubmit={this.doUpdate}/>);
  }

  reset() {this.form.reset();}

  async doUpdate(form) {
    try {
        let limits ={};
        limits.min = form.values().minimum;
        limits.max = form.values().maximum;
        delete form.values().minimum;
        delete form.values().maximum;
        form.values().limits = limits;
        if(form.values().quantity == 'pressure') form.values().unit = 'PSI';
        if(form.values().quantity == 'temperature') form.values().unit = 'C';
        if(form.values().quantity == 'humidity') form.values().unit = '%';
        if(form.values().quantity == 'flow') form.values().unit = 'gpm';
        await this.props.ws.update('sensor-types',form.values());
        this.props.app.select('sensor-types-search');
    }
    catch (err) {
      const msg = (err.message) ? err.message : 'web service error';
      form.setFormErrors([msg]);
    }
  }


  render() {
    return <div className="user-container">{this.form}</div>;
  }
}

module.exports = SensorTypesAdd;