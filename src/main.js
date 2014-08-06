var LINES_OPEN_DAY = 3;

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
	var begin = $.format.date(new Date(), 'yyyy-MM-dd 08:00');
	var end = $.format.date(new Date(), 'yyyy-MM-dd 17:00');

	var task = new Task(begin, end, $.cookie("project"), $.cookie("activity"), $("#description").val(), $("#site").val());

	aph.addTask(task, function(data, textStatus, jqXHR){
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

function addTaskAdmin(){
	var begin = $.format.date(new Date(), 'yyyy-MM-dd 17:01');
	var end = $.format.date(new Date(), 'yyyy-MM-dd 17:48');

	var task = new Task(begin, end, 2843001012, 28, "", "");

	aph.addTask(task, function(data, textStatus, jqXHR){
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

function checkBeforeSave(){
	aph.today(function(data, textStatus, jqXHR){
		var response = $.parseHTML(data);
		var finishButton = $(response).find("table").find("input[name='T']");

		if(finishButton.length > 0){
			addTaskNormal();
			addTaskAdmin();
		} else {
			showErrorFromAph("O dia atual j&aacute; est&aacute; finalizado.");
		}
	});
}

function formPopulate(setting){
	$("#registration").val(setting.registration);
	$("#cpf").val(setting.cpf);
	$("#password").val(setting.password());

	$( "option[value='" + setting.project + "']" ).prop( "selected", true);
	aph.activities(setting.project, function(data){
		$("#activity").empty();
		$.each(data, function( index, activity ) {
  			$("#activity").append('<option value="' + activity.codigo + '">' + activity.nome + '</option>');
		});
		$( "option[value='" + setting.activity + "']" ).prop( "selected", true);
	});
}

$(document).ready(function() {
	aph.settings = settings;
	settings.get(function(setting){
		formPopulate(setting);
	});

	$("#project").change(function(event){
		var selectElement = $(this);
		var form = $(this).parents("form").serializeJSON();
		settings.save(new Setting(form.registration, form.cpf, form.project, form.activity, form.password));
		aph.login(function(setting){
			aph.activities(selectElement.val(), formPopulate(setting));
		});
		
	});		

	$("#save").click(function(event){
		var form = $(this).parents("form").serializeJSON();
		settings.save(new Setting(form.registration, form.cpf, form.project, form.activity, form.password));
		redirectTo("index.html");
		event.preventDefault();
	});

	$("#cancel").click(function(event){
		redirectTo("index.html");
		event.preventDefault();
	});
	
	$("#send").click(function(event){
		aph.login(checkBeforeSave);
		event.preventDefault();
	});

	$("#no").click(function(event){
		closeExtension();
		event.preventDefault();
	});

	$("#yes").click(function(event){
		aph.finishToday();
		event.preventDefault();
	});

});