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
		var erro = getMessage(data, function(body){
			var messageElement = body.find(".style28")[1];
			return $(messageElement).text();			
		});

		if(undefined === erro){
			redirectTo("finish.html");
			showSuccessMessage("Tarefa inserida com sucesso.");
		} else {
			showErrorFromAph(message);
		}
	});
}

$(document).ready(function() {


	$("#send").click(function(event){
		login(function(){
			finishDay(function(data, textStatus, jqXHR){
				var response = $.parseHTML(data);
				var table = $(response).find("table")[10];
				var lines = $(table).find(".style28").text().trim();

				if(5 > lines){
					addTaskNormal();
				} else {
					showErrorFromAph("O dia atual j&aacute; est&aacute; finalizado.");
				}
			});
		});
		event.preventDefault();
	});

});