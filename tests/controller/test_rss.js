({
	testShow: function() {
		var db = require("utils/sqldatastore.js")("org.sqlite.JDBC","jdbc:sqlite:db/live");
		(function() {
			var controller = require("controller/rss.js")()
			var res = controller.show()
			assert(res[0] == "ok")	
		})()
	}
})
