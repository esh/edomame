(function() {
	importPackage(com.google.appengine.api.labs.taskqueue)

	function secure(fn) {
		if(request.authorization == "esh:" + config.sitepass) return fn()
		else return ["unauthorized"]
	}

	return {
		create: function() {
			return secure(function() {
				var queue = QueueFactory.getQueue("post-queue")
				queue.add(TaskOptions.Builder.url("/blog/process").payload(new java.lang.String(request.content).getBytes(), "application/json"))

				return ["ok", "ok"]
			})
		}
	}
})

