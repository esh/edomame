(function() {
	importPackage(com.google.appengine.api.datastore)
	importPackage(com.google.appengine.api.memcache)

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

				// cache the individual tags
				cache.put(tag, index[tag].sort(function(a, b) { return a.date - b.date }).map(function(e) { return e.key }))
			}

			// cache the tagset
			cache.put("_tags", tags.sort().toSource())
		}
	}
})

