(function() {
	importPackage(com.google.appengine.api.datastore)
	var ds = DatastoreServiceFactory.getDatastoreService()

	return {
		get: function() {
			var set = new Object()
			var tags = new Array()

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

			return tags.sort()
		}
	}
})
