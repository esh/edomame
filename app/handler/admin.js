(function() {
	importPackage(com.google.appengine.api.memcache, com.google.appengine.api.labs.taskqueue)

	var cache = MemcacheServiceFactory.getMemcacheService()
	var queue = QueueFactory.getQueue("tasks")

	var tagset = require("model/tagset.js")()
	
	function clearCache(request, response, session) {
		cache.clearAll()	
		return ["ok", "ok"]	
	}

	function buildIndex(request, response, session) {
		queue.add(TaskOptions.Builder.url("/_tasks/buildIndex"))	
		return ["ok", "ok"]	
	}
	
	return {
		clearCache: clearCache,
		buildIndex: buildIndex,
	}
})
