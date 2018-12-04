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


        (async ()=>{
            let hotpatchInstallStatus = await this.checkHotpatchInstallation();
            this.hotpatchStatus = hotpatchInstallStatus;
            this.messageInterface("Hotpach installation status: "+hotpatchInstallStatus);
            if(hotpatchInstallStatus){
                var jsoncode = await this.getSafeLua("sharedPlugins/researchSync/lua/json.lua");
                let mainCode = await this.getSafeLua("sharedPlugins/researchSync/lua/researchSync.lua");
                if(mainCode) returnValue = await messageInterface("/silent-command remote.call('hotpatch', 'update', '"+pluginConfig.name+"', '"+pluginConfig.version+"', '"+mainCode+"', \{json = '"+jsoncode+"'\})");
                if(returnValue) console.log(returnValue);
            }
        })().catch(e => console.log(e));

    };

    async getSafeLua(filePath){
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, "utf8", (err, contents) => {
                if(err){
                    reject(err);
                } else {
                    // split content into lines
                    contents = contents.split(/\r?\n/);

                    // join those lines after making them safe again
                    contents = contents.reduce((acc, val) => {
                        val = val.replace(/\\/g ,'\\\\');
                        // remove leading and trailing spaces
                        val = val.trim();
                        // escape single quotes
                        val = val.replace(/'/g ,'\\\'');

                        // remove single line comments
                        let singleLineCommentPosition = val.indexOf("--");
                        let multiLineCommentPosition = val.indexOf("--[[");

                        if(multiLineCommentPosition === -1 && singleLineCommentPosition !== -1) {
                            val = val.substr(0, singleLineCommentPosition);
                        }

                        return acc + val + '\\n';
                    }, ""); // need the "" or it will not process the first row, potentially leaving a single line comment in that disables the whole code

                    // console.log(contents);

                    // this takes about 46 ms to minify train_stop_tracking.lua in my tests on an i3
                    if(COMPRESS_LUA) contents = require("luamin").minify(contents);

                    resolve(contents);
                }
            });
        });
    }

    async checkHotpatchInstallation(){
        let yn = await this.messageInterface("/silent-command if remote.interfaces['hotpatch'] then rcon.print('true') else rcon.print('false') end");
        yn = yn.replace(/(\r\n\t|\n|\r\t)/gm, "");
        if(yn === "true"){
            return true;
        } else if(yn === "false"){
            return false;
        }
    }
	async scriptOutput(data) {
		data = JSON.parse(data);
		if(!this.researchDB[data.name]) this.researchDB[name] = {level:0};
		this.researchDB[data.name].level = data.level;
		this.socket.emit('research_added', {name: data.name, level: data.level})
	}
};
