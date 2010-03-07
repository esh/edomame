(function() {
	function secure(fn) {
		if(request.authorization == "esh:" + config.sitepass) return fn()
		else return ["unauthorized"]
	}

	function create() {
		return secure(function() {
			var t = eval(request.content)
			if(t.title != undefined && t.photo != undefined) {
				var post = require("model/post.js")().persist(null, t.title, t.tags, t.photo, t.ext, t.timestamp)
				
				if(post.tags.indexOf("tweet") != -1) {					
					require("utils/twitter.js")
					notify_twitter(post)
				}

				return ["ok", "ok"]
			} else {
				return ["ok", "missing title or photo"]
			}
		})
	}
	
	return {
		create: create
	}
})

