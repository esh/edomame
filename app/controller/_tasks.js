(function() {
	importPackage(com.google.appengine.api.datastore)
	importPackage(com.google.appengine.api.memcache)
	
	var ds = DatastoreServiceFactory.getDatastoreService()
	var cache = MemcacheServiceFactory.getMemcacheService()

	return {
		buildIndex: function() {
			log.info("rebuilding index")

			var index = new Object()
			for(var e in Iterator(ds.prepare(new Query("posts")).asIterator())) {
				var model = eval(e.getProperty("data").getValue())
				model.tags.forEach(function(tag) {
					if(!(tag in index)) {
						index[tag] = []
					}

					index[tag].push({
						key: KeyFactory.keyToString(e.getKey()),
						date: model.date
					})
				})
			}

			log.info(index.toSource())

			// remove old ones
			for(var e in Iterator(ds.prepare(new Query("tags")).asIterator())) {
				ds["delete"](e.getKey())
				cache["delete"](e.getKey().getName())
			}
			cache["delete"]("_tags")
	

			var tags = new Array()
			for(var tag in index) {
				tags.push(tag)

				var entity = new Entity(KeyFactory.createKey("tags", tag))
				entity.setProperty("data", new Text(index[tag].sort(function(a, b) { return a.date - b.date }).map(function(e) { return e.key }).toSource()))
				ds.put(entity)
			}

			// save down the entire set
			var entity = new Entity(KeyFactory.createKey("tags", "_tags"))
			entity.setProperty("data", new Text(tags.sort().toSource()))
			ds.put(entity)
			
			return ["ok", "ok"]
		}
	}
})

