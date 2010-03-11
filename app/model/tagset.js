(function() {
	importPackage(com.google.appengine.api.datastore)
	importPackage(com.google.appengine.api.memcache)
	var ds = DatastoreServiceFactory.getDatastoreService()
	var cache MemcacheServiceFactory.getMemcacheService()

	return {
		get: function(tag) {
			var posts = cache.get(tag)
			if(posts) {
				posts = eval(posts)
			} else {
				log.info("cache miss: " + tag)
				posts = new Array()
				for(var e in Iterator(ds.prepare(new Query("posts")).asIterator())) {
					var model = eval(e.getProperty("data").getValue())
					if(model.tags.indexOf(tag) >= 0) {
						posts.push(KeyFactory.keyToString(e.getKey()))
					}
				}
				cache.put(tag, posts.toSource())
			}
			
			return posts
		}
	}
})
