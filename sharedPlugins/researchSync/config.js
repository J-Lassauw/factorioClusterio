/*
	Clusterio plugin for synchronising research between servers
*/
module.exports = {
	// Name of package. For display somewhere I guess.
	name: "researchSync",
	version: "2.0.0",
	binary: "nodePackage",
	description: "Clusterio plugin for synchronising research between servers",
	scriptOutputFileSubscription: "researchSync.txt",
	masterPlugin: "masterPlugin.js",
};