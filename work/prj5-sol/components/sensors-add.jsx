const React = require('react');

const {FIELD_INFOS, fieldInfos} = require('../sensors-add');
const FormComponent = require('./form-component.jsx');

class  SensorsAdd extends React.Component {
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
        console.log(form.values());
        let expected ={};
        expected.min = form.values().sensorMin;
        expected.max = form.values().sensorMax;
        form.values().id = form.values().sensorID;
        delete form.values().sensorID; 
        delete form.values().sensorMin;
        delete form.values().sensorMax;
        form.values().expected = expected;
        
        await this.props.ws.update('sensors',form.values());
        this.props.app.select('sensors-search');
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

module.exports = SensorsAdd;