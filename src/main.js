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
		data: firstForm,
		statusCode: {
			302: function() {
				alert( ":-)" );
			}
		}
	});
}

function nextLogin(){
	$.ajax({
		cache: false,
		crossDomain: true,		
		type: 'POST',
		url:'http://aph.egs.com.br/aph/acesso_SV_3.ASP',
		data: {ACESSO_1:$("#password").val()},
		success: function(data, status, request){
			console.log("Senha enviada");
			lastLogin();
		},
		error: function(request, status, errorThrown) {
			save = false;
			alert("Fail nextLogin");		
		}
	});
}

function lastLogin(){
	$.ajax({
		cache: false,
		crossDomain: true,		
		type: 'GET',
		url:'http://aph.egs.com.br/aph/VALIDALOGIN.ASP',
		success: function(data, status, request){
			console.log("Logado com sucesso");
			save = true;
		},
		error: function(request, status, errorThrown) {
			save = false;
			alert("Fail lastLogin");		
		}
	});
}

function addTaskAdmin(){
	var task = {
				evento:1,
				data_ini1:"2014-7-22 08:00",
				data_fin1:"2014-7-22 17:00",
				PROJETO:2843001012,
				ATIVIDADE:28,
				ETIPO_1:"HORARIO NORMAL",
				ETOL_1:"",
				EINI_1:"2014-07-22 08:00",
				EFIN_1:"2014-07-22 17:00",
				TOT_1:"0,1",
				E_DESC_1:"",
				E_BA_1:""
			   }


	$.ajax({
		cache: false,
		crossDomain: true,		
		type: 'POST',
		url:'http://aph.egs.com.br/aph/SALVA.asp',
		data: task,
		success: function(data, status, request){
			save = false;
			console.log("Logado com sucesso");
		},
		error: function (request, status, errorThrown) {
			alert("Fail task");
		}
	});
}

$(document).ready(function() {
	initCookies();

	$("#send").click(function(event){
		console.log("Iniciando");
		login();
		if(save){
			addTaskAdmin();	
		}
		event.preventDefault();
	});

});