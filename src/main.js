var save = false;

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

	$("#registration").val($.cookie("registration"));
	$("#cpf").val($.cookie("cpf"));
	$("#password").val($.cookie("password"));
}

function login(){
	var firstForm = { MATRICULA_TXT:$("#registration").val(), "CPF_TXT":$("#cpf").val()}

	$.ajax({
		cache: false,
		crossDomain: true,		
		type: 'POST',
		url:'http://aph.egs.com.br/aph/acesso.ASP',
		data: firstForm
	}).done(function( data, textStatus, jqXHR ) {
		if(/Mensagem\s+do Sistema/.test(jqXHR.responseText)){
			console.log("error on login");
		} else {
			nextLogin();
		}
	});
}

function nextLogin(){
	$.ajax({
		cache: false,
		crossDomain: true,		
		type: 'POST',
		url:'http://aph.egs.com.br/aph/acesso_SV_3.ASP',
		data: {ACESSO_1:$("#password").val()}
	}).done(function(data, textStatus, jqXHR) {
		if(/Mensagem\s+do Sistema/.test(jqXHR.responseText)){
			console.log("error on next login");
		} else {
			lastLogin();
		}		
	});
}

function lastLogin(){
	$.ajax({
		cache: false,
		crossDomain: true,		
		type: 'GET',
		url:'http://aph.egs.com.br/aph/VALIDALOGIN.ASP',
	}).done(function(data, textStatus, jqXHR) {
		addTaskNormal();
	});
}

function Task(begin, end, project, activety, description, site){
	this.evento = 1;
	this.data_ini1 = begin;
	this.data_fin1 = end;
	this.PROJETO = project;
	this.ATIVIDADE = activety;
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

	var task = new Task(begin, end, 4503621, 81, $("#description").val(), $("#site").val());

	$.ajax({
		cache: false,
		crossDomain: true,		
		type: 'POST',
		url:'http://aph.egs.com.br/aph/SALVA.asp',
		data: task,
	}).done(function(data, textStatus, jqXHR){
		window.close();
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
		data: task,
		success: function(data, status, request){
			save = false;
			console.log("task");
		},
		error: function (request, status, errorThrown) {
			console.log("Logado com error");	
		}
	});
}

$(document).ready(function() {
	initCookies();

	$("#send").click(function(event){
		login();
		event.preventDefault();
	});

	$("#save").click(function(event){
		$.cookie("registration", $("#registration").val(), {path : '/'});
		$.cookie("cpf", $("#cpf").val(), {path : '/'});
		$.cookie("password", $("#password").val(), {path : '/'});
		window.location = "index.html"
		event.preventDefault();
	});	

});