(function() {
	importPackage(com.google.appengine.api.datastore)
	var ds = DatastoreServiceFactory.getDatastoreService()

	return {
		buildIndex: function() {
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

