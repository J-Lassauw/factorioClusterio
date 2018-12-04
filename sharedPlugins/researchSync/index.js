const pluginConfig = require("./config");
const clusterUtil = require("./lib/clusterUtil.js");
const fs = require("fs");

const COMPRESS_LUA = false;

module.exports = class remoteCommands {
	constructor(mergedConfig, messageInterface, extras) {
		this.messageInterface = messageInterface;
		this.config = mergedConfig;
		this.socket = extras.socket;
		this.registered = false;

		this.researchDB = {};

		this.socket.on("hello", () => {
			this.socket.emit("registerResearchSync", {
				instanceID: this.config.unique,
			});
		});

		this.socket.on("researchDatabase", async data => {
			this.researchDB = data;
			this.messageInterface("/silent-command " +
				'remote.call("researchSync", "setResearch", "' + JSON.stringify(this.researchDB) + '")');
		});


	};

	async scriptOutput(data) {
		data = JSON.parse(data);
		if(!this.researchDB[data.name]) this.researchDB[name] = {level:0};
		this.researchDB[data.name].level = data.level;
		this.socket.emit('research_added', {name: data.name, level: data.level})
	}
};
