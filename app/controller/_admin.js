(function() {
	importPackage(com.google.appengine.api.memcache, com.google.appengine.api.labs.taskqueue)

	var cache = MemcacheServiceFactory.getMemcacheService()
	var queue = QueueFactory.getQueue("tasks")

	function show() {
		return login()
	}

	function secure(fn) {
		if(session["authorized"]) return fn()
		else return ["unauthorized"]
	}

	function login() {
		if(request.params["passcode"] == config.sitepass) {
			session["authorized"] = true
			session["attempt"] = null
			return ["redirect", "/"]
		} else if(session["attempt"] == null || session["last"] < (new Date()).getTime()) {
			session["attempt"] = session["attempt"] == null ? 1 : session["attempt"] + 1
			session["last"] = (new Date()).getTime() + 8000 * session["attempt"]
			return ["ok", render("view/admin/password.jhtml", new Object())]
		} else {
			return ["unauthorized"]
		}
	}
	
	function logout() {
		session["authorized"] = false
		return ["redirect", "/"]
	}
	
	function clearCache() {
		return secure(function() {
			cache.clearAll()	
			return ["ok", "ok"]	
		})
	}

	function buildIndex() {
		return secure(function() {
			queue.add(TaskOptions.Builder.url("/_tasks/buildIndex"))	
			return ["ok", "ok"]	
		})
	}

	function tweet() {
		return secure(function() {
			var model = {
				key: "testing",
				title: "testing edomame - tweeter"
			}

			queue.add(TaskOptions.Builder.url("/_tasks/tweet").param("model", model.toSource()))
			return ["ok", "ok"]	
		})
	}

	return {
		show: show,
		login: login,
		logout: logout,
		clearCache: clearCache,
		buildIndex: buildIndex,
		tweet: tweet
	}
})
