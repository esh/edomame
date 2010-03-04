(function() {
	importPackage(com.google.appengine.api.datastore)
	var ds = DatastoreServiceFactory.getDatastoreService()

	return {
		get: function(tag) {
			var posts = new Array()

			var itor = ds.prepare(new Query("posts")).asIterator()
			while(itor.hasNext()) {
				var model = eval(itor.next().getProperty("data").getValue())
				if(model.tags.indexOf(tag) != 0) {
					posts.push(model.key)
				}
			}

			return posts
		}
	}
})
