YUI.add('util', function(Y){
	var loadTemplate = function(templateName, callback) { 
	   	// This loads template 
		$.get('/templates/' + templateName, callback); 
	}
	
	Y.Util = {
		
		renderTemplate: function(templateName, data, callback, opt1) { 
	       loadTemplate(templateName, function (template) { 
	           callback(Mustache.to_html(template, data), opt1); 
	       }); 
	   	}
	}
});