(function() {
	importPackage(com.google.appengine.api.memcache, com.google.appengine.api.labs.taskqueue)

	var cache = MemcacheServiceFactory.getMemcacheService()
	var queue = QueueFactory.getQueue("tasks")

	function login(request, response, session) {
			session["authorized"] = true
			return ["redirect", "/"]
	}
	
	function logout(request, response, session) {
		session["authorized"] = false
		return ["redirect", "/"]
	}
	
	function clearCache(request, response, session) {
		cache.clearAll()	
		return ["ok", "ok"]	
	}

	function buildIndex(request, response, session) {
		queue.add(TaskOptions.Builder.url("/_tasks/buildIndex"))	
		return ["ok", "ok"]	
	}
	
	return {
		login: login,
		logout: logout,
		clearCache: clearCache,
		buildIndex: buildIndex
	}
})