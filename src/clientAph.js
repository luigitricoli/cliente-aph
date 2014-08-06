var VALID_MESSAGE = /\w.+[\w!]/;
var APH_ERROR = /Mensagem\s+do Sistema/;
var emptyFunction = function(){};

function getAphUrl(path){
	return 'http://aph.egs.com.br/aph/' + path;
}

function getMessage(data, message, posProcessor){
	var response = $.parseHTML(data)
	var text = message($(response));

	if(undefined !== posProcessor){
		text = posProcessor(text);
	}

	return VALID_MESSAGE.test(text) ? VALID_MESSAGE.exec(text)[0] : undefined;
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

function login(setting){
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

				aph.callbackFail(setting, cause);
			} else {
				return nextLogin(setting);
			}
		});
}

function nextLogin(setting){

	postToAph('acesso_SV_3.ASP', {ACESSO_1: setting.password()},
		function(data, textStatus, jqXHR) {
			if(APH_ERROR.test(jqXHR.responseText)){
				var cause = getMessage(data, function(body){
								var messageElement = body.find(".style2").children("div")[0];
								return $(messageElement).html();
							}, function(text){
								return text.replace(/[^\w\s!]/,"&atilde;");
							});
				
				aph.callbackFail(setting, cause);
			} else {
				lastLogin(setting);
			}		
		});
}

function lastLogin(setting){
	getToAph('VALIDALOGIN.ASP', function(data, textStatus, jqXHR) {
		aph.callbackDone(setting);
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

function addTask(task, setting){
	postToAph('SALVA.asp', task, function(data, textStatus, jqXHR){
		var cause = getMessage(data, function(body){
			var messageElement = body.find(".style28")[1];
			return $(messageElement).text();			
		});

		if(undefined === cause){
			aph.callbackDone(setting);
		} else {
			aph.callbackFail(setting, cause);
		}
	});
}

function beforeAddTask(task, setting){
	aph.today(function(data, textStatus, jqXHR){
		var response = $.parseHTML(data);
		var finishButton = $(response).find("table").find("input[name='T']");

		if(finishButton.length > 0){
			addTask(task, setting);
		} else {
			aph.callbackFail(setting, "O dia atual j&aacute; est&aacute; finalizado.");
		}
	});
}

var aph = {
	settings : {},
	get : getToAph,
	post : postToAph,
	login : function(){
		settings.get(function(setting){
			login(setting);
		});
		return this;
	},
	activities : getActivities,
	addTask : function(task){
		settings.get(function(setting){
			beforeAddTask(task, setting);
		});
		return this;
	},
	today : getDay,
	finishToday: finishDay,
	callbackDone: emptyFunction,
	done: function(callback){
		this.callbackDone = callback;
		return this;
	},
	callbackFail: emptyFunction,
	fail: function(callback){
		this.callbackFail = callback;
		return this;
	},	
};

