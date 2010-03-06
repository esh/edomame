(function() {
	importPackage(com.google.appengine.api.datastore)
	var ds = DatastoreServiceFactory.getDatastoreService()

	return {
		get: function(tag) {
			var posts = new Array()
			for(var e in Iterator(ds.prepare(new Query("posts")).asIterator())) {
				var model = eval(e.getProperty("data").getValue())
				if(model.tags.indexOf(tag) != 0) {
					posts.push(KeyFactory.keyToString(e.getKey()))
				}
			}
			
			return posts
		}
	}
})
