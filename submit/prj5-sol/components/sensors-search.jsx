const React = require('react');

const {FIELD_INFOS, fieldInfos} = require('../sensors-search');
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
    const infos = fieldInfos(Object.keys(FIELD_INFOS), extraInfos);
    this.info = infos;
    this.state = {
      result: [],
      from: 0
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.form = (<FormComponent infos={infos} onSubmit={this.onSubmit}/>);
    this.size = 5;
  }

  //setFormErrors(errors) { this.setState({formErrors: errors}); }
  reset() {
    this.form.reset();
  }

  async componentDidMount() {
    await this.setState({result: await this.props.ws.list('sensors', {})});
  }

  async onSubmit(form) {
    try {
      if (Object.values(form.values()).length === 0) {
        const msg = 'Please enter one or more fields';
        form.setFormErrors([msg]);
      }
      form.values().id = form.values().sensorID;
      delete form.values().sensorID;
      const sensor = await this.props.ws.list('sensors', form.values());
      this.setState({result: sensor});
    }
    catch (err) {
      if (err.status === 404) {
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
    if (this.state.result.data !== undefined && this.info !== undefined) {
      const [infos, values] = [this.info, this.state.result.data];
      let currentFrom = this.state.from;
      let size = this.size;

      const fields =
        values.map((f, i) => {
          if (i >= currentFrom && i < (currentFrom + size)) {
            return (
              <tr>
                <td>{f.id}</td>
                <td>{f.model}</td>
                <td>{f.period}</td>
                <td>{f.expected.min}</td>
                <td>{f.expected.max}</td>
              </tr>
            );
          }
        });
      return fields;
    }
  };

  handlePaginationClicked(direction) {
    let isBackEnabled = this.state.from > 0;
    if (direction === "back" && isBackEnabled) {
      let newFrom = this.state.from - 5 >= 0 ? this.state.from - 5 : 0;
      this.setState({
        from: newFrom
      })
    } else if (direction === "next") {
      let newFrom = this.state.from + 5;
      this.setState({
        from: newFrom
      })
    }
  }

  render() {
    const st = this.userDetails();
    let isBackDisabled = this.state.from > 0 ? "enableButton" : "disableButton";

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
          <tr>
            <th></th>
            <th></th>
            <th></th>
            <th>
              <div className={"myButton " + isBackDisabled}
                   onClick={this.handlePaginationClicked.bind(this, "back")}>{"<<"}</div>
            </th>
            <th>
              <div className={"myButton"} onClick={this.handlePaginationClicked.bind(this, "next")}>{">>"}</div>
            </th>
          </tr>
        </table>


      </div>
    );
  }
}

module.exports = SensorsSearch;