(function() {
	function secure(fn) {
		if(request.authorization == "esh:" + config.sitepass) return fn()
		else return ["unauthorized"]
	}

	function create() {
		return secure(function() {
			with(eval(request.content)) {
				if(title != undefined && photo != undefined) {
					var post = require("model/post.js")(ds).persist(
						null,
						title,
						tags,
						new org.apache.commons.codec.binary.Base64().decode(photo))

					if(post.tags.indexOf("tweet") != -1) {					
						require("utils/twitter.js")
						notify_twitter(post)
					}
	
					return ["ok", "ok"]
				} else {
					return ["ok", "missing title or photo"]
				}
			}
		})
	}
	
	return {
		create: create
	}
})

