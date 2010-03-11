(function() {
	importPackage(com.google.appengine.api.datastore)
	importPackage(com.google.appengine.api.memcache)
	var ds = DatastoreServiceFactory.getDatastoreService()
	var cache = MemcacheServiceFactory.getMemcacheService()

	return {
		get: function() {
			var tags = cache.get("_tags")
			if(tags) {
				tags = eval(tags)
			} else {	
				tags = new Array()
				var set = new Object()

				var itor = ds.prepare(new Query("posts")).asIterator()
				while(itor.hasNext()) {
					var model = eval(itor.next().getProperty("data").getValue())
					model.tags.forEach(function(t) {
						set[t] = 0
					})
				}
				for(var t in set) {
					tags.push(t)
				}

				tags = tags.sort()
				cache.put("_tags", tags.toSource())
			}

			return tags
		}
	}
})
