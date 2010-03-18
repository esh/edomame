(function() {
	importPackage(com.google.appengine.api.datastore)
	importPackage(com.google.appengine.api.memcache)
	var ds = DatastoreServiceFactory.getDatastoreService()
	var cache = MemcacheServiceFactory.getMemcacheService()

	return {
		get: function(tag) {
			var posts = cache.get(tag)
			if(posts) {
				return eval(posts)
			} else {
				return []
			}
		}
	}
})
