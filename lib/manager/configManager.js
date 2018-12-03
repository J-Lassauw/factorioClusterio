/**
Provides tools for managing both masters and slaves config files.
@module configManager
*/
// require modules
const asTable = require("as-table").configure({delimiter: ' | '});
const fs = require("fs");

// internal requires
var config = require("./../../config");
const objectOps = require("./../objectOps.js");
/**
console.log()s each entry in the config

@param {string} instance Either undefined, "shared" or the instance to show the config for.
*/
module.exports.displayConfig = function(instance){
	console.log(asTable(this.getConfig(instance)));
}
module.exports.getConfig = async function(instance){
	if(!instance || instance == "shared"){
		let configArray = [];
		Object.keys(config).forEach(key=>{
			if(key != "__comment"){
				if(typeof config[key] == "object"){
					configArray.push({entry: key, value: JSON.stringify(config[key])});
				} else configArray.push({entry: key, value: config[key]});
			}
		});
		return configArray;
	}
}
module.exports.editConfig = function(instance, entry, newValue){
	if(!instance || instance == "shared"){
		if(config[entry] && newValue){
			if(objectOps.isJSON(newValue)){
				config[entry] = JSON.parse(newValue);
				console.log("Changed config entry "+entry+" from "+JSON.stringify(config[entry])+" to "+JSON.stringify(newValue));
				// console.log("new config file:");
				// console.log(JSON.stringify(config, null, "	"))
				fs.writeFileSync("config.json", JSON.stringify(config, null, 4));
				return {
					ok:true,
					msg:`Changed config entry ${entry} from Object to ${JSON.stringify(newValue)}`,
				}
			} else {
				config[entry] = newValue;
				console.log("Changed config entry "+entry+" from "+config[entry]+" to '"+newValue+"'");
				// console.log("new config file:");
				// console.log(JSON.stringify(config, null, "	"))
				fs.writeFileSync("config.json", JSON.stringify(config, null, 4));
				return {
					ok:true,
					msg:`Changed config entry ${entry} from ***** to '${newValue}'`,
				};
			}
		} else {
			return {
				ok:false,
				msg:`No such config parameter`,
			}
		}
	} else {
		return {
			ok:false,
			msg:`Editing config for single instances is not yet supported`,
		}
	}
};
