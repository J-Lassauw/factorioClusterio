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
				console.log("research_added: "+data.name);
			});
			this.socket.on("research_removed", async data => {
				this.lastSeen = Date.now();
				await this.removeResearch(data);
				console.log("research_removed: "+data.name);
			});
		})();
	}
	async addResearch({level, name, acquired}){
		let research = await this.master.getResearch();
		if(!research[this.instanceID]) research[this.instanceID] = {};
		if(!research[this.instanceID][name]) research[this.instanceID][name] = {name, level:0, acquired};
		research[this.instanceID][name].name = name;
		research[this.instanceID][name].level = level;
		research[this.instanceID][name].acquired = level;

		await this.master.saveResearch();
		return true;
	}
	async removeResearch({name}){
		let research = await this.master.getResearch();
		if(!research[this.instanceID][name]){
			return true;
		} else {
			research[this.instanceID][name].level = 0;
			research[this.instanceID][name].acquired = Date.now();
			await this.master.saveResearch();
			return true;
		}
	}
}

class masterPlugin {
	constructor({config, pluginConfig, path, socketio, express}){
		this.config = config;
		this.pluginConfig = pluginConfig;
		this.pluginPath = path;
		this.io = socketio;
		this.express = express;

		this.clients = {};
		this.io.on("connection", socket => {
			for(let id in this.clients){
				if(Date.now() - this.clients[id].lastSeen > 60000){
					delete this.clients[id];
				}
			}
			socket.on("registerResearch", data => {
				console.log("Registered research sync "+data.instanceID);
				this.clients[data.instanceID] = new ResearchSync({
					master:this,
					instanceID: data.instanceID,
					socket,
				});
			});
		});

		this.express.get("/api/research/getResearch", async (req,res) => {
			res.send(await this.getResearch());
		});
	}
	getResearch(){
		return new Promise((resolve) => {
			if(this.researchDatabase){
				console.log(this.researchDatabase);
				resolve(this.researchDatabase);
			} else {
				fs.readFile("database/researchDatabase.json", (err, data) => {
					if(err && typeof(data) !== "number"){
						this.researchDatabase = {};
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
				console.log(this.researchDatabase);
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
