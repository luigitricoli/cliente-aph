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

function addNormalTask(setting){
	var begin = $.format.date(new Date(), 'yyyy-MM-dd 09:00');
	var end = $.format.date(new Date(), 'yyyy-MM-dd 18:00');

	var task = new Task(begin, end, setting.project, setting.activity, $("#description").val(), $("#site").val());

	aph.addTask(task)
		.done(function(setting){
			redirectTo("finish.html");
		})
		.fail(function(setting, cause){
			showErrorFromAph(cause);
		});
}

function selectActivityPopulate(data, setting){
	$("#activity").empty();
	$.each(data, function( index, activity ) {
			$("#activity").append('<option value="' + activity.codigo + '">' + activity.nome + '</option>');
	});
	$( "option[value='" + setting.activity + "']" ).prop( "selected", true);
}

function formPopulate(setting){
	$("#registration").val(setting.registration);
	$("#cpf").val(setting.cpf);
	$("#password").val(setting.password());

	$( "option[value='" + setting.project + "']" ).prop( "selected", true);
	loadActivities();
	
}

function loadActivities(showMsg){
	aph.login()
		.done(function(setting){
			if(showMsg){
				showSuccessMessage("Login efetuado com sucesso.");	
			}
			aph.activities($("#project").val(), function(data){
				selectActivityPopulate(data, setting);
			});
		})
		.fail(function(setting, cause){
			showErrorFromAph(cause);
		});
}

$(document).ready(function() {
	aph.settings = settings;
	settings.get(function(setting){
		formPopulate(setting);
	});
 
	$("#project").change(function(event){
		var form = $(this).parents("form").serializeJSON();
		settings.save(new Setting(form.registration, form.cpf, form.project, form.activity, form.password));
		loadActivities(true);
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
				addNormalTask(setting);
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