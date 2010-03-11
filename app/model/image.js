(function() {
	importPackage(com.google.appengine.api.datastore)
	importPackage(com.google.appengine.api.memcache)
	var ds = DatastoreServiceFactory.getDatastoreService()
	var cache = MemcacheServiceFactory.getMemcacheService()

	return {
		get: function(keys) {
			var size = 0
			var chunks = keys.map(function(e) {
				var b = cache.get(e)
				if(!b) {
					b = ds.get(KeyFactory.stringToKey(e)).getProperty("data").getBytes()
					cache.put(e, b)
				}

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
