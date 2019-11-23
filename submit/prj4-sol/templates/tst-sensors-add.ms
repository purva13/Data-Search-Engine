<!DOCTYPE html>
<html>
  <head>
    <title>Create / Add Sensor </title>
    <link rel="stylesheet" href="{{{base}}}/css/style.css">
  </head>
  <body>
    <h1>Create / Add Sensor </h1>
    <ul>
      {{#errors}}
        <li class="error">{{.}}</li>
      {{/errors}}
    </ul>
    <form method="POST" action="{{{base}}}/tst-sensors-add.html">
	{{#fields}}
    {{#isSensor}}
	    <label>
	    <span class="label">
	      {{#isRequired_sensor}}*{{/isRequired_sensor}}{{friendlyName}}:
	    </span>
	    <input name="{{name}}" {{#type}}type="{{type}}"{{/type}}
	           value="{{value}}">
	    </label>
	    <br/>
	    {{#errorMessage}}
	      <span class="error">{{errorMessage}}</span><br/>
	    {{/errorMessage}}
        {{/isSensor}}
	 {{/fields}}
      <input name="submit" type="submit" value="Add" class="control">
    </form> 
    {{>footer}}
  </body>
</html>
