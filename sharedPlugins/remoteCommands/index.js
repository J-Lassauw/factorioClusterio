module.exports = class remoteCommands {
	constructor(mergedConfig, messageInterface, extras){
		this.messageInterface = messageInterface;
		this.config = mergedConfig;
		this.socket = extras.socket;
		
		if(this.config.allowRemoteCommandExecution){
			this.socket.on("runCommand", data => {
				let {commandID} = data;
				this.messageInterface(data.command);
				if(commandID){
					this.socket.emit("runCommandReturnValue", {
						commandID,
						body: {
							info: "Command was sent to factorio",
						},
					});
				}
			});
		}
	}
	scriptOutput(data){
        // we don't return anything yet
    }
}
