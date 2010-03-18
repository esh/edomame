(function() {
	importPackage(com.google.appengine.api.datastore)
	importPackage(com.google.appengine.api.memcache)
	var ds = DatastoreServiceFactory.getDatastoreService()
	var cache = MemcacheServiceFactory.getMemcacheService()

	return {
		get: function() {
			var tags = cache.get("_tags")
			if(tags) {
				return eval(tags)
			} else {
				return []
			}
		}
	}
})
