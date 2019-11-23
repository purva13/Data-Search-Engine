<!DOCTYPE html>
<html>
  <head>
    <title>Create / Add Sensor Type </title>
    <link rel="stylesheet" href="{{{base}}}/css/style.css">
  </head>
  <body>
    <h1>Create / Add Sensor Type</h1>
    <ul>
      {{#errors}}
        <li class="error">{{.}}</li>
      {{/errors}}
    </ul>
    <form method="POST" action="{{{base}}}/tst-sensor-types-add.html">
	{{#fields}}
    {{#isSensorType}}
	    <label>
	    <span class="label">
	      {{#isRequired}}*{{/isRequired}}{{friendlyName}}:
	    </span>
      {{#isSelect}}
      <select name="quantity" id="quantity" class="tst-quantity">
      <option value="" selected>
        Select
      </option>
      <option value="temperature">
        Temperature
      </option>
      <option value="pressure">
        Pressure
      </option>
      <option value="flow">
        Flow Rate
      </option>
      <option value="humidity">
        Relative Humidity
      </option>
      </select>
      {{/isSelect}}
      {{^isSelect}}
	    <input name="{{name}}" {{#type}}type="{{type}}"{{/type}}
	           value="{{value}}">
      {{/isSelect}}
	    </label>
	    <br/>
	    {{#errorMessage}}
	      <span class="error">{{errorMessage}}</span><br/>
	    {{/errorMessage}}
        {{/isSensorType}}
	 {{/fields}}
      <input name="submit" type="submit" value="Add" class="control">
    </form> 
    {{>footer}}
  </body>
</html>