var save = false;
var VALID_MESSAGE = /\w.+[\w!]/;

function initCookies(){
	if(undefined === $.cookie("registration")){
		$.cookie("registration", "", {path : '/'});
	}
	if(undefined === $.cookie("cpf")){
		$.cookie("cpf", "", {path : '/'});
	}
	if(undefined === $.cookie("password")){
		$.cookie("password", "", {path : '/'});
	}
	if(undefined === $.cookie("project")){
		$.cookie("project", "", {path : '/'});
	}
	if(undefined === $.cookie("activity")){
		$.cookie("activity", "", {path : '/'});
	}
}

function showErrorMessage(message){
	$(".notification .error").html("APH diz: " + message)
	$(".notification").show();
}

function showSuccessMessage(message){
	$(".notification .success").html("APH diz: " + message)
	$(".notification").show();
}

function getMessage(data){
	var response = $.parseHTML(data)
	var messageElement = $(response).find(".style28")[1];
	var message = $(messageElement).text();
	return VALID_MESSAGE.test(message) ? VALID_MESSAGE.exec(message)[0] : undefined;
}

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

function login(successCallback){
	var firstForm = { MATRICULA_TXT:$.cookie("registration"), "CPF_TXT":$.cookie("cpf")}

	$.ajax({
		cache: false,
		crossDomain: true,		
		type: 'POST',
		url:'http://aph.egs.com.br/aph/acesso.ASP',
		data: firstForm
	}).done(function(data, textStatus, jqXHR) {
		if(/Mensagem\s+do Sistema/.test(data)){
			var response = $.parseHTML(data)
			var messageElement = $(response).find(".style2").children("div")[0];
			var message = $(messageElement).html().replace(/[^\w\s!]/,"&aacute;");
			message = /\w.+[\w!]/.exec(message)[0];
			showErrorMessage(message);
		} else {
			nextLogin(successCallback);
		}
	});
}

function nextLogin(successCallback){
	$.ajax({
		cache: false,
		crossDomain: true,		
		type: 'POST',
		url:'http://aph.egs.com.br/aph/acesso_SV_3.ASP',
		data: {ACESSO_1:$.cookie("password")}
	}).done(function(data, textStatus, jqXHR) {
		if(/Mensagem\s+do Sistema/.test(jqXHR.responseText)){
			var response = $.parseHTML(data)
			var messageElement = $(response).find(".style2").children("div")[0];
			var message = $(messageElement).html().replace(/[^\w\s!]/,"&atilde;");
			message = /\w.+[\w!]/.exec(message)[0];
			showErrorMessage(message);
		} else {
			lastLogin(successCallback);
		}		
	});
}

function lastLogin(successCallback){
	$.ajax({
		cache: false,
		crossDomain: true,		
		type: 'GET',
		url:'http://aph.egs.com.br/aph/VALIDALOGIN.ASP',
	}).done(function(data, textStatus, jqXHR) {
		if(undefined !== successCallback){
			successCallback();	
		}
	});
}

function Task(begin, end, project, activity, description, site){
	this.evento = 1;
	this.data_ini1 = begin;
	this.data_fin1 = end;
	this.PROJETO = project;
	this.ATIVIDADE = activity;
	this.ETIPO_1 = "HORARIO NORMAL";
	this.ETOL_1 = "";
	this.EINI_1 = begin;
	this.EFIN_1 = end;
	this.TOT_1 = "0,1";
	this.E_DESC_1 = description;
	this.E_BA_1 = site;

}

function addTaskNormal(){
	var begin = $.format.date(new Date(), 'yyyy-MM-dd 09:00');
	var end = $.format.date(new Date(), 'yyyy-MM-dd 18:00');

	var task = new Task(begin, end, $.cookie("project"), $.cookie("activity"), $("#description").val(), $("#site").val());

	$.ajax({
		cache: false,
		crossDomain: true,		
		type: 'POST',
		url:'http://aph.egs.com.br/aph/SALVA.asp',
		data: task,
	}).done(function(data, textStatus, jqXHR){
		var message = getMessage(data);
		if(undefined === message){
			window.location = "finish.html";
			showSuccessMessage("Tarefa inserida com sucesso.");
		} else {
			showErrorMessage(message);
		}
	});
}

function addTaskAdmin(){
	var begin = $.format.date(new Date(), 'yyyy-MM-dd 17:01');
	var end = $.format.date(new Date(), 'yyyy-MM-dd 17:48');

	var task = new Task(begin, end, 2843001012, 28, '', '');

	$.ajax({
		cache: false,
		crossDomain: true,		
		type: 'POST',
		url:'http://aph.egs.com.br/aph/SALVA.asp',
		data: task
	});
}

function finishDay(){
	$.ajax({
		cache: false,
		crossDomain: true,		
		type: 'POST',
		url:'http://aph.egs.com.br/aph/exibe_dia.asp',
		data:{DATA: $.format.date(new Date(), 'dd/MM/yyyy')}
	}).done(function(data, textStatus, jqXHR){
		var response = $.parseHTML(data);
		var table = $(response).find("table")[10];
		var inputs = $(table).find("input");

		var form = {DATABASE: $.format.date(new Date(), 'dd/MM/yyyy')};

		$.each(inputs, function( index, element ) {
			var input = $(element);
			form[input.attr("name")]=input.val();
		});

		$.ajax({
			cache: false,
			crossDomain: true,		
			type: 'POST',
			url:'http://aph.egs.com.br/aph/FECHADIA.ASP',
			data: form
		}).done(function(data, textStatus, jqXHR){
			window.close();
		});
	});
}

$(document).ready(function() {
	initCookies();

	$("#send").click(function(event){
		login(function(){
			addTaskNormal();
		});
		event.preventDefault();
	});

	$("#save").click(function(event){
		$.cookie("registration", $("#registration").val(), {path : '/'});
		$.cookie("cpf", $("#cpf").val(), {path : '/'});
		$.cookie("password", $("#password").val(), {path : '/'});
		$.cookie("project", $("#project").val(), {path : '/'});
		$.cookie("activity", $("#activity").val(), {path : '/'});
		window.location = "index.html"
		event.preventDefault();
	});	

	$("#cancel").click(function(event){
		window.location = "index.html"
		event.preventDefault();
	});	

	$("#project").change(function(event){
		var select = $(this);
		login(function(){
			getActivities(select.val());	
		});
		
	});	

	$("#no").click(function(event){
		window.close();
		event.preventDefault();
	});

	$("#yes").click(function(event){
		finishDay();
		event.preventDefault();
	});

});