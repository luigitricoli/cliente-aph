var VALID_MESSAGE = /\w.+[\w!]/;
var APH_ERROR = /Mensagem\s+do Sistema/;
var LINES_OPEN_DAY = 3;

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

function showMessage(selector, message, label){
	var notification = $(".notification");
	var textComponent = notification.find(selector);

	var finalMessage = undefined === label ? "" : label;
	finalMessage += message;
	
	notification.find("span").empty();
	textComponent.html(finalMessage);
	notification.show();
}

function showErrorFromAph(message){
	showMessage(".error", message, "APH diz: ");
}

function showSuccessMessage(message){
	showMessage(".success", message);
}

function getMessage(data, message, posProcessor){
	var response = $.parseHTML(data)
	var text = message($(response));

	if(undefined !== posProcessor){
		text = posProcessor(text);
	}

	return VALID_MESSAGE.test(text) ? VALID_MESSAGE.exec(text)[0] : undefined;
}

function redirectTo(path){
	window.location = path;
}

function closeExtension(){
	window.close();
}

function getAphUrl(path){
	return 'http://aph.egs.com.br/aph/' + path;
}

function postToAph(path, data, doneCallback){
	var url = getAphUrl(path);
	var request = {cache: false, crossDomain: true, type: 'POST', url: url};
	if(undefined !== data){
		request['data'] = data;
	}

	$.ajax(request).done(doneCallback);
}

function getToAph(path, doneCallback){
	var url = getAphUrl(path);
	var request = {cache: false, crossDomain: true, type: 'POST', url: url};

	$.ajax(request).done(doneCallback);	
}

function login(successCallback){
	var firstForm = { MATRICULA_TXT:$.cookie("registration"), CPF_TXT:$.cookie("cpf")}

	postToAph('acesso.ASP', firstForm, 
		function(data, textStatus, jqXHR){
			if(APH_ERROR.test(data)){
				var erro = getMessage(data, function(body){
					var messageElement = body.find(".style2").children("div")[0];
					return $(messageElement).html();
				}, function(text){
					return text.replace(/[^\w\s!]/,"&aacute;");
				});

				showErrorFromAph(erro);
			} else {
				nextLogin(successCallback);
			}
		});
}

function nextLogin(successCallback){

	postToAph('acesso_SV_3.ASP', {ACESSO_1: $.cookie("password")},
		function(data, textStatus, jqXHR) {
			if(APH_ERROR.test(jqXHR.responseText)){
				var erro = getMessage(data, function(body){
								var messageElement = body.find(".style2").children("div")[0];
								return $(messageElement).html();
							}, function(text){
								return text.replace(/[^\w\s!]/,"&atilde;");
							});
				
				showErrorFromAph(erro);
			} else {
				lastLogin(successCallback);
			}		
		});
}

function lastLogin(successCallback){
	getToAph('VALIDALOGIN.ASP', 
		function(data, textStatus, jqXHR) {
			if(undefined !== successCallback){
				showSuccessMessage("Login efetuado com sucesso.")
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


	postToAph('SALVA.asp', task, 
		function(data, textStatus, jqXHR){
			var erro = getMessage(data, function(body){
				var messageElement = body.find(".style28")[1];
				return $(messageElement).text();			
			});

			if(undefined === erro){
				redirectTo("finish.html");
			} else {
				showErrorFromAph(erro);
			}
		});
}

function getDay(successCallback){
	postToAph('exibe_dia.asp', {DATA: $.format.date(new Date(), 'dd/MM/yyyy')}, successCallback);
}

function finishDay(){
	getDay(finish);
}

function finish(data, textStatus, jqXHR){
	var response = $.parseHTML(data);
	var table = $(response).find("table")[10];
	var inputs = $(table).find("input");

	var form = {DATABASE: $.format.date(new Date(), 'dd/MM/yyyy')};

	$.each(inputs, function( index, element ) {
		var input = $(element);
		form[input.attr("name")]=input.val();
	});

	postToAph('FECHADIA.ASP', form, 
		function(data, textStatus, jqXHR){
			closeExtension();
		});
}

function checkBeforeSave(){
	getDay(function(data, textStatus, jqXHR){
		var response = $.parseHTML(data);
		var finishButton = $(response).find("table").find("input[name='T']");

		if(finishButton.length > 0){
			addTaskNormal();
		} else {
			showErrorFromAph("O dia atual j&aacute; est&aacute; finalizado.");
		}
	});
}

$(document).ready(function() {
	initCookies();

	$("#send").click(function(event){
		login(checkBeforeSave);
		event.preventDefault();
	});

	$("#no").click(function(event){
		closeExtension();
		event.preventDefault();
	});

	$("#yes").click(function(event){
		finishDay();
		event.preventDefault();
	});

});