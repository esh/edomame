({
	testShow: function() {
		var db = require("utils/sqldatastore.js")("org.sqlite.JDBC","jdbc:sqlite:db/live");
		var session = new Object();
		(function() {
			var controller = require("controller/blog.js")()
			var res = controller.show("all")
			assert(res[0] == "ok")	
		})()

	},
	testDetails: function() {
		var db = require("utils/sqldatastore.js")("org.sqlite.JDBC","jdbc:sqlite:db/live");
		(function() {
			var controller = require("controller/blog.js")()
			var res = controller.detail(0)
			assert(res[0] == "ok" && eval(res[1]).key == 0)	
		})()
	}
})
