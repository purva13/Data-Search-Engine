const React = require('react');

const {FIELD_INFOS, fieldInfos} = require('../sensor-type-search');
const FormComponent = require('./form-component.jsx');

class SensorTypeSearch extends React.Component {
  constructor(props) {
    super(props);
    const extraInfos = {
      submit: {
        type: 'submit',
        value: 'Search',
      },

    };
    const infos  = fieldInfos(Object.keys(FIELD_INFOS), extraInfos);
    this.info = infos;
    this.state = { result: [] };
    this.onSubmit=this.onSubmit.bind(this);
    this.form = (<FormComponent infos={infos} onSubmit={this.onSubmit}/>); 
  }

  //setFormErrors(errors) { this.setState({formErrors: errors}); }
  reset() {this.form.reset();}
  async componentDidMount() {await this.setState({result:await this.props.ws.list('sensor-types',{})});}

  async onSubmit(form) {
    try {
      if(Object.values(form.values()).length === 0){
        const msg = 'Please enter one or more fields';
        form.setFormErrors([msg]);
      }
      const sensorT1=await this.props.ws.list('sensor-types',form.values());
      this.setState({result:sensorT1});
      console.log(sensorT1);
      
    }
    catch (err) {
      if(err.status === 404){
        const msg = 'No such entries found';
        form.setFormErrors([msg]);
      }
      else {
        const msg = (err.message) ? err.message : 'web service error';
        form.setFormErrors([msg]);
      }    
    }
  }

  userDetails() {
    if(this.state.result.data!==undefined && this.info !==undefined){
        const [infos, values] = [this.info, this.state.result.data];
        const fields =
            values.map((f, i) => {
                return (
                <tr>
                    <td>{f.manufacturer}</td>
                    <td>{f.id}</td>
                    <td>{f.modelNumber}</td>
                    <td>{f.quantity}</td>
                    <td>{f.limits.min}</td>
                    <td>{f.limits.max}</td>
                </tr>
                );
            });
        return fields;
    }
  };

  render() {
    const st=this.userDetails();
    return (
      <div className="user-container">{this.form}
        <h2>Results Summary</h2>

    <table className="summary">
    <thead>
       <tr>
              <th>Manufacturer</th>
              <th>Sensor Type ID</th>
              <th>Model Number</th>
              <th>Quantity</th>
              <th colSpan="2">Limits</th>
       </tr>
       <tr>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th>Min</th>
              <th>Max</th>
       </tr>
       </thead>
       <tbody>
           {st}
       </tbody>
       </table>
        
    
      </div>
    );
  }
}

module.exports = SensorTypeSearch;