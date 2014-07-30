function getActivities(projectId, successCallback){
	var path = 'http://aph.egs.com.br/aph/ajaxat.asp?pjt=' + projectId;

	$.ajax({
		cache: false,
		crossDomain: true,		
		type: 'GET',
		url: path
	}).done(function(data, textStatus, jqXHR) {
		$("#activity").empty();
		$.each(data, function( index, activity ) {
  			$("#activity").append('<option value="' + activity.codigo + '">' + activity.nome + '</option>');
		});

		if(undefined !== successCallback){
			successCallback();
		}
	});	
}

function load(){
	$("#registration").val($.cookie("registration"));
	$("#cpf").val($.cookie("cpf"));
	$("#password").val($.cookie("password"));

	$( "option[value='" + $.cookie("project") + "']" ).prop( "selected", true);
	getActivities($.cookie("project"), function(){
		$( "option[value='" + $.cookie("activity") + "']" ).prop( "selected", true);
	});
}

function save(element, event){
	$.cookie("registration", $("#registration").val(), {path : '/'});
	$.cookie("cpf", $("#cpf").val(), {path : '/'});
	$.cookie("password", $("#password").val(), {path : '/'});
	$.cookie("project", $("#project").val(), {path : '/'});
	$.cookie("activity", $("#activity").val(), {path : '/'});
	redirectTo("index.html");
}

$(document).ready(function() {
	load();

	$("#project").change(function(event){
		var selectElement = $(this);
		login(function(){
			getActivities(selectElement.val());
		});
		
	});		

	$("#save").click(function(event){
		save(this, event);
		event.preventDefault();
	});

	$("#cancel").click(function(event){
		redirectTo("index.html");
		event.preventDefault();
	});
});