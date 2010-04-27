(function() {
	importPackage(com.google.appengine.api.datastore)
	importPackage(com.google.appengine.api.memcache)
	var ds = DatastoreServiceFactory.getDatastoreService()
	var cache = MemcacheServiceFactory.getMemcacheService()

	return {
		get: function(tag) {
			var posts = cache.get(tag)
			if(posts == null) {
				log.info("cache miss: " + tag) 
				posts = ds.get(KeyFactory.createKey("meta", tag)).getProperty("data").getValue()
				cache.put(tag, posts)
			}

			return eval(posts)
		}
	}
})
