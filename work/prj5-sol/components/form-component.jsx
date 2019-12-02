const React = require('react');

//implementation only handles text-box oriented input widgets;
//does not handle selects, radio or checkboxes.
class FormComponent extends React.Component {

  constructor(props) {
    super(props);
    const infos = this.infos = props.infos;
    this.initValues = props.values || {};
    this.state = { values: this.initValues, errors: {}, formErrors: [], };
    this.parentSubmit = props.onSubmit;
    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

  }

  reset() {
    this.setState({ values: this.initValues, errors: {} });
  }

  errors() { return this.state.errors; }
  values() { return this.state.values; }

  hasErrors() { return Object.keys(this.state.errors).length > 0; }

  setFormErrors(errors) { this.setState({formErrors: errors}); }

  addError(name, msg) {
    const updated = Object.assign({}, this.state.errors, {[name]: msg});
    this.setState({errors: updated});
  }

  deleteError(name) {
    const updated = Object.assign({}, this.state.errors);
    delete updated[name];
    this.setState({errors: updated});
  }

  /** If everything ok, this handler delegates form submission to
   *  containing component via incoming props.onSubmit() handler.
   */
  async onSubmit(event) {
    event.preventDefault();
    let formErrors;
    if (this.hasErrors()) {
      formErrors = ['Please fix errors shown below before submitting'];
    }
    else {
      formErrors = await this.parentSubmit(this);
    }
    if (formErrors) this.setState({formErrors: formErrors});
  }

  /** validate field which blur'd */
  onBlur(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value || '';
    const info = this.infos[name] || {};
    if (info.isRequired) {
      if (!value) {
        this.addError(name, `Field ${info.friendlyName} is required`);
      }
    }
    if (value && info.regex) {
      if (value.match(info.regex)) {
        if (this.state.errors[name]) { //delete error message
          this.deleteError(name);
        }
      }
      else {
        this.addError(name, info.error);
      }
    }
  }

  //must have an onChange event for controlled components so that
  //value in state always reflects current user input.
  onChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value || '';
    const values = Object.assign({}, this.state.values, { [name]: value });
    this.setState({values: values});
  }

  render() {
    const fields = Object.keys(this.infos).map((f, i) => {
      const info = this.infos[f];
      const { type, autocomplete}  = info;
      const [value, error] = [
        this.state.values[f] || info.value || '',
        this.state.errors[f] || ''
      ];
      const label = (info.type === 'submit') ? '' : ((info.friendlyName || f) + ':');
      if (info.friendlyName === 'Quantity') {
        return (
          <div className="field" key={i}>
            <label className="field-name">{label}</label>
            <select>
              <option value="temperature">Temperature</option>
              <option value="quantity">Quantity</option>
              <option value="flow">Flow</option>
              <option value="pressure">Pressure</option>
            </select>
          </div>
        );
      }
      else {
        return (
          <div className="field" key={i}>
            <label className="field-name">{label}</label>
            <input name={f} type={type} autoComplete={autocomplete}
                   value={value} className="field-value"
                   onChange={this.onChange} onBlur={this.onBlur}/>
            <span className="error">{error}</span>
          </div>
        );
      }
    });
    const formErrors =
          this.state.formErrors.map(
            (e, i) => <li key={i} className="error">{e}</li>
          );
    return (
      <form onSubmit={this.onSubmit}>
        <ul>{formErrors}</ul>
        <div className="user">
          {fields}
        </div>
      </form>
    );
  }
}

module.exports = FormComponent;