$(document).ready(function() {
	$("#registration").val($.cookie("registration"));
	$("#cpf").val($.cookie("cpf"));
	$("#password").val($.cookie("password"));

	$( "option[value='" + $.cookie("project") + "']" ).prop( "selected", true);
	getActivities($.cookie("project"), function(){
		$( "option[value='" + $.cookie("activity") + "']" ).prop( "selected", true);
	});
});