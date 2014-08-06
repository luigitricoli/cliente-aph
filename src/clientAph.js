var VALID_MESSAGE = /\w.+[\w!]/;
var APH_ERROR = /Mensagem\s+do Sistema/;

function addError(message){
	var index = aph.errors.length;
	aph.errors[index] = message;
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
	var request = {cache: false, crossDomain: true, type: 'GET', url: url};

	$.ajax(request).done(doneCallback);	
}

function login(setting, successCallback){
	var firstForm = { MATRICULA_TXT : setting.registration, 
					  CPF_TXT : setting.cpf }

	postToAph('acesso.ASP', firstForm, 
		function(data, textStatus, jqXHR){
			if(APH_ERROR.test(data)){
				var cause = getMessage(data, function(body){
					var messageElement = body.find(".style2").children("div")[0];
					return $(messageElement).html();
				}, function(text){
					return text.replace(/[^\w\s!]/,"&aacute;");
				});

				aph.addError(cause);
			} else {
				return nextLogin(setting, successCallback);
			}
		});
}

function nextLogin(setting, successCallback){

	postToAph('acesso_SV_3.ASP', {ACESSO_1: setting.password()},
		function(data, textStatus, jqXHR) {
			if(APH_ERROR.test(jqXHR.responseText)){
				var erro = getMessage(data, function(body){
								var messageElement = body.find(".style2").children("div")[0];
								return $(messageElement).html();
							}, function(text){
								return text.replace(/[^\w\s!]/,"&atilde;");
							});
				
				aph.addError(cause);
			} else {
				lastLogin(setting, successCallback);
			}		
		});
}

function lastLogin(setting, successCallback){
	getToAph('VALIDALOGIN.ASP', 
		function(data, textStatus, jqXHR) {
			if(undefined !== successCallback){
				successCallback(setting);	
			}
		});
}

function getActivities(projectId, successCallback){
	var path = 'ajaxat.asp?pjt=' + projectId;

	getToAph(path, function(data, textStatus, jqXHR) {
		if(undefined !== successCallback){
			successCallback(data);
		}
	});	
}

function addTask(doneCallback){
	postToAph('SALVA.asp', task, doneCallback);
}

function getDay(doneCallback){
	postToAph('exibe_dia.asp', {DATA: $.format.date(new Date(), 'dd/MM/yyyy')}, doneCallback);
}

function finishDay(){
	aph.today(finish);
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

var aph = {
	settings : {},
	errors : [],
	addError : addError,
	get : getToAph,
	post : postToAph,
	login : function(callback){
		settings.get(function(setting){
			login(setting, callback);
		});
	},
	activities : getActivities,
	addTask : addTask,
	today : getDay,
	finishToday: finishDay
};