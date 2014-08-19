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

function beforeAddTask(task, setting){
	aph.today(function(data, textStatus, jqXHR){
		var response = $.parseHTML(data);
		var finishButton = $(response).find("table").find("input[name='T']");
		var beginTime = $(response).find("table").find("input[name='EVE_INI_2']").val();
		var endTime = $(response).find("table").find("input[name='EVE_FIN_2']").val();

		if(finishButton.length > 0){
			if(/08:00$/.test(beginTime) && /17:48$/.test(endTime)){
				task = addAdminTask(setting);
			}
			addTask(task, setting);
		} else {
			aph.callbackFail(setting, "O dia atual j&aacute; est&aacute; finalizado.");
		}
	});
}

function addAdminTask(baseTask, setting){
	var begin = $.format.date(new Date(), 'yyyy-MM-dd 17:01');
	var end = $.format.date(new Date(), 'yyyy-MM-dd 17:48');
	var task = new Task(begin, end, 2843001012, 28, "", "");
	addTask(task,setting);

	newBegin = task.data_ini1.replace(/[0-9]{2}:[0-9]{2}$/, "08:00")
	newEnd = task.data_fin1.replace(/[0-9]{2}:[0-9]{2}$/, "17:00")
	return new Task(begin, end, baseTask.PROJETO, baseTask.ATIVIDADE, baseTask.E_DESC_1, baseTask.E_BA_1);
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

