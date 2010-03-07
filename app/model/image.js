(function() {
	importPackage(com.google.appengine.api.datastore)
	var ds = DatastoreServiceFactory.getDatastoreService()

	return {
		get: function(keys) {
			var size = 0
			var chunks = keys.map(function(e) {
				var b = ds.get(KeyFactory.stringToKey(e)).getProperty("data").getBytes()
				size += b.length
				return b
			})

			var b = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, size)
			var pos = 0
			for(var i = 0 ; i < chunks.length ; i++) {
				java.lang.System.arraycopy(chunks[i], 0, b, pos, chunks[i].length)
				pos += chunks[i].length 
			}

			return b
		}
	}
})
