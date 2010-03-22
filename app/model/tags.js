(function() {
	importPackage(com.google.appengine.api.datastore)
	importPackage(com.google.appengine.api.memcache)
	var ds = DatastoreServiceFactory.getDatastoreService()
	var cache = MemcacheServiceFactory.getMemcacheService()

	return {
		get: function() {
			var tags = cache.get("_tags")
			if(tags == null) {
				log.info("cache miss: _tags")
				tags = ds.get(KeyFactory.createKey("tags", "_tags")).getProperty("data").getValue()
				cache.put("_tags", tags)
			} 
			
			return eval(tags)
		}
	}
})
