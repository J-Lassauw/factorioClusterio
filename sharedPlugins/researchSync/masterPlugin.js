const fs = require("fs");

class ResearchSync {
	constructor({socket, instanceID, master}){
		this.socket = socket;
		this.instanceID = instanceID;
		this.master = master;

		this.lastSeen = Date.now();

		(async () => {
			setInterval(async () => {
				this.socket.emit("researchDatabase", await this.master.getResearch());
			}, 10000);
			this.socket.on("getResearch", async () => {
				this.lastSeen = Date.now();
				this.socket.emit("researchDatabase", await this.master.getResearch());
			});
			this.socket.on("research_added", async data => {
				this.lastSeen = Date.now();
				await this.addResearch(data);
			});
			// this.socket.on("research_removed", async data => {
			// 	this.lastSeen = Date.now();
			// 	await this.removeResearch(data);
			// 	console.log("research_removed: "+data.name);
			// });
		})();
	}
	async addResearch({name, level}){
		let research = await this.master.getResearch();
		if(!research) research = {};
		if(!research[name]) research[name] = {level:0, acquired};
		research[name].level = level;
		research[name].acquired = Date.now();
		await this.master.saveResearch();
		return true;
	}
	// async removeResearch({name}){
	// 	let research = await this.master.getResearch();
	// 	if(!research[name]){
	// 		return true;
	// 	} else {
	// 		research[name].level = 0;
	// 		research[name].acquired = Date.now();
	// 		await this.master.saveResearch();
	// 		return true;
	// 	}
	// }
}

class masterPlugin {
	constructor({config, pluginConfig, path, socketio, express}){
		this.config = config;
		this.pluginConfig = pluginConfig;
		this.pluginPath = path;
		this.io = socketio;
		this.express = express;

		this.clients = {};
		this.researchDatabase = {};

		this.getResearch();

		this.io.on("connection", socket => {
			for(let id in this.clients){
				if(Date.now() - this.clients[id].lastSeen > 60000){
					delete this.clients[id];
				}
			}

			socket.on("registerResearchSync", data => {
				this.clients[data.instanceID] = new ResearchSync({
					master:this,
					instanceID: data.instanceID,
					socket,
				});
				socket.emit("researchDatabase", this.researchDatabase);
			});

		});

		this.express.get("/api/research/getResearch", async (req,res) => {
			res.send(await this.getResearch());
		});
	}

	getResearch(){
		return new Promise((resolve) => {
			if(this.researchDatabase){
				resolve(this.researchDatabase);
			} else {
				fs.readFile("database/researchDatabase.json", (err, data) => {
					if(err && typeof(data) !== "number"){
						this.researchDatabase = {};
                        this.saveResearch();
						resolve(this.researchDatabase);
					} else {
						this.researchDatabase = JSON.parse(data.toString());
						resolve(this.researchDatabase);
					}
				});
			}
		});
	}

	saveResearch(){
		return new Promise((resolve, reject) => {
			if(this.researchDatabase){
				fs.writeFile("database/researchDatabase.json", JSON.stringify(this.researchDatabase, null, 4), (err) => {
					if(err){
						reject(err);
					} else {
						resolve("Database successfully saved");
					}
				});
			} else {
				resolve("Nothing to save");
			}
		});
	}
}
module.exports = masterPlugin;
