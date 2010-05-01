(function() {
	importPackage(com.google.appengine.api.labs.taskqueue)
	importPackage(org.apache.commons.codec.binary)

	var queue = QueueFactory.getQueue("tasks")

	function secure(fn) {
		if(request.authorization == "esh:" + config.sitepass) return fn()
		else return ["unauthorized"]
	}

	function create() {
		return secure(function() {
			var t = eval(request.content)
			if(t.title != undefined && t.photo != undefined) {
				var post = require("model/post.js")().persist(null, t.title, t.tags, Base64.decodeBase64(t.photo), t.ext, t.timestamp)
				if(post.tags.indexOf("tweet") != -1) {					
					queue.add(TaskOptions.Builder.url("/_tasks/tweet").param("model", post.toSource()))
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

