var assert = require('assert');
var libomega = require('./libomega');

describe("libomega.js", function(){
	describe("libomega.clone()", function(){
		it("clones javascript objects", function(){
			var object1 = {hello:"world", cat:{legs:4, name:"Kitty", colors:["brown", "yellow", "purple"]}};
			var object2 = {};
			object2 = libomega.clone(object1);
			
			assert.equal(object2.cat.name, object1.cat.name)
			assert.equal(object1.hello, object2.hello)
		});	
		it("does not deep clone objects", function(){
			var obj1 = {hello:"world", cat:{legs:4, name:"Kitty", colors:["brown", "yellow", "purple"]}};
			var obj2 = {};
			obj2 = libomega.clone(obj1);
			
			obj1.cat.colors = "black";
			assert.equal(obj1.cat.colors, "black");
			assert.notEqual(obj2.cat.colors[1], "yellow");
		});
	});
	describe("libomega.deepclone()", function(){
		it("deep clones javascript objects", function(){
			var obj1 = {hello:"world", cat:{legs:4, name:"Kitty", colors:["brown", "yellow", "purple"]}};
			var obj2 = {};
			obj2 = libomega.deepclone(obj1);
			
			obj1.cat.colors = "black";
			assert.equal(obj1.cat.colors, "black");
			assert.equal(obj2.cat.colors[1], "yellow");
		});
		it("throws on non JSON parameters", function(){
			x = function(){};
			assert.throws(function(){
				y = libomega.deepclone(x)
			});
		});
	});
});