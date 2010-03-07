(function() {
	require("utils/common.js")
	importPackage(com.google.appengine.api.datastore)
	importPackage(org.apache.commons.codec.binary)

	var ds = DatastoreServiceFactory.getDatastoreService()
	
	var MAX_SIZE = 1000*1000
	
	function get(key) {
		return eval(ds.get(KeyFactory.stringToKey(key)).getProperty("data").getValue())
	}
	
	function persist(key, title, tags, photo, ext) {
		var transaction = ds.beginTransaction()
		try {
			var parent = ds.allocateIds("posts", 1).getStart() 
			var builder = new KeyFactory.Builder(parent)

			// split the tags into an array and ensure we have the "all" tag
			tags = tags != null && tags.trim().length > 0 ? tags.trim().toLowerCase().split(" ") : new Array()
			if(tags.indexOf("all") == -1) tags.push("all")
		
			var model = {
				title: title,
				tags: tags,
				timestamp: new Date()
			}
		
			if(photo && ext) {
				model.ext = ext
				photo = Base64.decodeBase64(photo) 
				model.original = new Array()
				// save the original by splitting into MAX_SIZE byte chunks
				var chunk = 0
				for(var key in Iterator(ds.allocateIds(parent, "original", Math.ceil(photo.length / MAX_SIZE)).iterator())) {
					var entity = new Entity(key)
					var b = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, Math.min(photo.length - chunk * MAX_SIZE, MAX_SIZE))
					java.lang.System.arraycopy(photo, chunk * MAX_SIZE, b, 0, Math.min((chunk + 1) * MAX_SIZE, photo.length))
					entity.setProperty("data", new Blob(b))
					ds.put(entity)

					model.original.push(KeyFactory.keyToString(key))
					chunk++
				}
			}

			var entity = new Entity(parent)
			entity.setProperty("data", new Text(model.toSource()))
			ds.put(entity)

			// create preview
			// resize(newPath + "/o.jpg", newPath + "/p.jpg", 370)

			transaction.commit()

			return model 
		} catch(e) {
			log.severe(e)
			log.severe("rolling back")
			transaction.rollback()

			throw e
		}	
	}
	
	function remove(key) {
		var transaction = ds.beginTransaction()
		try {
			var key = KeyFactory.createKey("posts", key)
			var model = eval(ds.get(KeyFactory.createKey("posts", key)))

			model.original.forEach(function(e) {
				ds["delete"](KeyFactory.createKey("posts", e))
			})

			ds["delete"](key)

			transaction.commit()
		} catch(e) {
			log.severe(e)
			log.severe("rolling back")
			transaction.rollback()

			throw e
		}	
	}
	
	return {
		get: get,
		persist: persist,
		remove: remove
	}
})
