<!DOCTYPE html>
<html>
  <head>
    <title>Sensor Type Search</title>
    <link rel="stylesheet" href="{{{base}}}/css/style.css">
  </head>
  <body>
    <h1>Sensor Type Search</h1>
    <ul>
      {{#errors}}
        <li class="error">{{.}}</li>
      {{/errors}}
    </ul>
    <form method="GET" action="{{{base}}}/tst-sensor-types-search.html">
	{{#fields}}
  {{#isSensorType}}
  {{#isSearch}}
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
    {{/isSearch}}
    {{/isSensorType}}
	 {{/fields}}
      <input name="submit" type="submit" value="Search" class="control">
    </form>

<h2>Results Summary</h2>

    <table class="summary">
        <thead>
    	   <tr>
                  <th>Sensor Type ID</th>
                  <th>Model Number</th>
                  <th>Manufacturer</th>
                  <th>Quantity</th>
                  <th colspan="2">Limits</th>
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
              {{#users}}
              <tr>
              {{#fields}}
              {{#value}}
              <td>{{value}}</td>
              {{/value}}
              {{/fields}}
              </tr>
              {{/users}}
         </tbody>
    </table>
    </body>
    <div class = "scroll">
    {{#previous}}
      <a class = "tst-prev" href="{{previous}}" rel="prev">&lt;&lt;</a>
    {{/previous}}
    {{#next}}
      <a class = "tst-next" href="{{next}}" rel="next">&gt;&gt;</a>
    {{/next}}
    </div>

    {{>footer}}
</html>
