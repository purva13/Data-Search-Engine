//-*- mode: rjsx-mode;

'use strict';

const React = require('react');
const ReactDom = require('react-dom');
const FormComponent =  require('./form-component.jsx');
const SensorTypesSearch = require('./sensor-types-search.jsx');
const SensorTypesAdd = require('./sensor-types-add.jsx');
const SensorsSearch = require('./sensors-search.jsx');
const SensorsAdd = require('./sensors-add.jsx');

const Tab = require('./tab.jsx');

/*************************** App Component ***************************/

const TABS = {
  'sensor-types-search': 'Search Sensor Types',
  'sensor-types-add': 'Add Sensor Type',
  'sensors-search': 'Search Sensors',
  'sensors-add': 'Add Sensor'
};

class App extends React.Component {

  constructor(props) {
    super(props);

    this.select = this.select.bind(this);
    this.isSelected = this.isSelected.bind(this);

    this.state = {
      selected: 'sensor-types-search',
      'sensor-types-search': <SensorTypesSearch ws={props.ws} app={this}/>,
      'sensor-types-add': <SensorTypesAdd ws={props.ws} app={this}/>,
      'sensors-search': <SensorsSearch ws={props.ws} app={this}/>,
      'sensors-add': <SensorsAdd ws={props.ws} app={this}/>,
    };

  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  isSelected(v) { return v === this.state.selected; }

  select(v) {
    this.setState({selected: v});
  }

  getComponent(v) {
    let component = null;
    //@TODO
    const rand=Math.random();
    switch(v){
      case 'sensor-types-search':
        component=<SensorTypesSearch ws={this.props.ws} app={this} key={rand}/>;
        break; 
    
      case 'sensor-types-add':
          component=<SensorTypesAdd ws={this.props.ws} app={this} key={rand}/>;
          break;

      case 'sensors-search':
          component=<SensorsSearch ws={this.props.ws} app={this} key={rand}/>;
          break;

      case 'sensors-add':
          component=<SensorsAdd ws={this.props.ws} app={this} key={rand}/>;
          break;
    }
    return component;
  }

  render() {
    const wsState = this.props.ws.nChanges;
    const tabs = Object.entries(TABS).map(([k, v], i) => {
      const component = this.getComponent(k);
      const label = v;
      const isSelected = (this.state.selected === k);
      const tab = (
        <Tab component={component} id={k}
             label={label} index={i} key={i}
             select={this.select} isSelected={isSelected}/>
      );
      return tab;
    });

    return <div className="tabs">{tabs}</div>
  }

}

module.exports = App;
