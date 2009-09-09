({
	testReliable: function() {
		var config = require("config.js") 
		function sleep(time) {
			log.info("overridden")	
		}
			
		var i = 0
		function hpost(url, params, msg) {
			log.info("pwnz0rs")
			if(i > 5) {
				i = 0
				return "ok"
			} else {
				i++
				throw "it broke!"
			}
		}

	
		(function() {
			require("utils/twitter.js")
			assert(true)	
		})()
	}
})
