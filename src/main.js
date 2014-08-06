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

function addTaskNormal(callback){
	var begin = $.format.date(new Date(), 'yyyy-MM-dd 08:00');
	var end = $.format.date(new Date(), 'yyyy-MM-dd 17:00');

	var task = new Task(begin, end, $.cookie("project"), $.cookie("activity"), $("#description").val(), $("#site").val());

	aph.addTask(task)
		.done(function(setting){
			callback(setting);
		})
		.fail(function(setting, cause){
			showErrorFromAph(cause);
		});
}

function addTaskAdmin(){
	var begin = $.format.date(new Date(), 'yyyy-MM-dd 17:01');
	var end = $.format.date(new Date(), 'yyyy-MM-dd 17:48');

	var task = new Task(begin, end, 2843001012, 28, "", "");

	aph.addTask(task)
		.done(function(setting){
			redirectTo("finish.html");
		})
		.fail(function(setting, cause){
			showErrorFromAph(cause);
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

function loadActivities(setting){
	aph.login()
		.done(function(setting){
			showSuccessMessage("Login efetuado com sucesso.");
			aph.activities(selectElement.val(), formPopulate(setting));
		})
		.fail(function(setting, cause){
			showErrorFromAph(cause);
		});	
}

$(document).ready(function() {
	aph.settings = settings;
	settings.get(function(setting){
		formPopulate(setting);
		loadActivities(setting);
	});
 
	$("#project").change(function(event){
		var selectElement = $(this);
		var form = $(this).parents("form").serializeJSON();
		settings.save(new Setting(form.registration, form.cpf, form.project, form.activity, form.password));
		loadActivities(setting);
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
		aph.login()
			.done(function(setting){
				addTaskNormal(addTaskAdmin);
			})
			.fail(function(setting, cause){
				showErrorFromAph(cause);
			});
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