const React = require('react');

const {FIELD_INFOS, fieldInfos} = require('../lib/sensors-search');
const FormComponent = require('./form-component.jsx');

class SensorsSearch extends React.Component {
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
  async componentDidMount() {await this.setState({result:await this.props.ws.list('sensors',{})});}

  async onSubmit(form) {
    try {
        form.values().id = form.values().sensorID;
        delete form.values().sensorID;
        const sensor = await this.props.ws.list('sensors',form.values());
        this.setState({result:sensor});
    }
    catch (err) {
      const msg = (err.message) ? err.message : 'web service error';
      form.setFormErrors([msg]);
    }
  }

  userDetails() {
    if(this.state.result.data!==undefined && this.info !==undefined){
        const [infos, values] = [this.info, this.state.result.data];
        console.log(values);
        const fields =
            values.map((f, i) => {
                return (
                <tr>
                    <td>{f.id}</td>
                    <td>{f.model}</td>
                    <td>{f.period}</td>
                    <td>{f.expected.min}</td>
                    <td>{f.expected.max}</td>
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
              <th>Sensor ID</th>
              <th>Model</th>
              <th>Period</th>
              <th colSpan="2">Expected</th>
       </tr>
       <tr>
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

module.exports = SensorsSearch;