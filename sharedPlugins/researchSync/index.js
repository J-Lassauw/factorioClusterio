const fs = require('fs');

class ResearchSync {
	constructor(slaveConfig, messageInterface, extras = {}){
		this.config = slaveConfig;
		this.messageInterface = messageInterface;
		this.functions = ResearchSync.loadFunctions();

		this.research = {};

		this.socket.on("researchDatabase", async researchDB => {
			this.research = researchDB;
		});

		setInterval(() => {
			this.pollResearch();
		}, extras.researchSyncPollInterval || 5000);

		fs.watch('somedir', function (event, filename) {
			console.log('event is: ' + event);
			if (filename) {
				console.log('filename provided: ' + filename);
			} else {
				console.log('filename not provided');
			}
		});
	}

	static loadFunctions() {
		return {
			dumpResearch: ResearchSync.loadFunc("lua/dumpResearch.lua"),
			enableResearch: ResearchSync.loadFunc("lua/enableResearch.lua"),
		};
	}

	static loadFunc(path) {
		return fs.readFileSync("sharedPlugins/researchSync/" + path,'utf-8').replace(/\r?\n|\r/g,' ');
	}

	scriptOutput(data){
		let kv              = data.split(":");
		let name            = kv[0];
		let researched      = ('true' !== kv[1]
			? 0
			: 1);
		let level           = parseInt(kv[2]);
		if (!isNaN(level) && !isNaN(researched)) {
			this.research[name] = {researched: researched, level: level};
		}
	}
}

module.exports = ResearchSync;
