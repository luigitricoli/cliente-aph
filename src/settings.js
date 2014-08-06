function Setting(registration, cpf, project, activity, pass, rawPass){
	this.registration = registration;
	this.cpf = cpf;
	this.project = project;
	this.activity = activity;
	this.__pass__ = rawPass ? pass : $.base64.encode(pass);
}

Setting.prototype.password = function(value){
								if(undefined === value){
									return $.base64.decode(this.__pass__);
								} else {
									this.__pass__ = $.base64.encode(value);
								}
							};

var settings = {
	get : function(callback){
		chrome.storage.sync.get('settings', function(items){
			var setting = items.settings;
			if(undefined !== setting){
				setting = new Setting(setting.registration, setting.cpf, setting.project, setting.activity, setting.__pass__, true);
			} else {
				setting = new Setting("","","","","");
			}
			
			if(callback !== undefined){
				callback(setting);
			}
		});
	},
	save : function(data){
		chrome.storage.sync.set({'settings': data});
	}
};