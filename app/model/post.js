(function() {
	require("utils/common.js")
	importPackage(com.google.appengine.api.datastore)
	importPackage(com.google.appengine.api.memcache)
	importPackage(com.google.appengine.api.labs.taskqueue)
	importPackage(com.google.appengine.api.images)
	importPackage(org.apache.commons.codec.binary)

	var ds = DatastoreServiceFactory.getDatastoreService()
	var cache = MemcacheServiceFactory.getMemcacheService()
	var is = ImagesServiceFactory.getImagesService()
	var queue = QueueFactory.getQueue("tasks")

	var MAX_SIZE = 1000*1000

	function removeImages(keys) {
		keys.forEach(function(e) {
			ds["delete"](KeyFactory.stringToKey(e))
			cache["delete"](e)
		})
	}

	function invalidateCache(key, tags) {
		cache["delete"](key)
		cache["delete"](KeyFactory.keyToString(KeyFactory.createKey("tags", "_tag")))
		tags.forEach(function(tag) { cache["delete"](tag) })
	}

	function get(key) {
		var model = cache.get(key)
		if(model == null) {
			log.info("cache miss: " + key) 
			model = ds.get(KeyFactory.stringToKey(key)).getProperty("data").getValue()
			cache.put(key, model)
		}
		
		return eval(model)
	}

	return {
		get: get,
		persist: function(key, title, tags, photo, ext, timestamp) {
			var transaction = ds.beginTransaction()
			try {
				log.info(key + " " + title + " " + tags)
				var parent
				var model

				if(key) {
					parent = KeyFactory.stringToKey(key)
					model = get(key) 
				} else {
					parent = ds.allocateIds("posts", 1).getStart()
					model = new Object()
				}

				// split the tags into an array and ensure we have the "all" tag
				tags = tags != null && tags.trim().length > 0 ? tags.trim().toLowerCase().split(" ") : new Array()
				if(tags.indexOf("all") == -1) tags.push("all")
	
				model.key = KeyFactory.keyToString(parent)	
				model.title = title
				model.tags = tags
				model.date = timestamp ? new Date(timestamp) : new Date()
		
				if(photo && ext) {
					model.ext = ext
					photo = Base64.decodeBase64(photo) 
					model.original = new Array()
					// save the original by splitting into MAX_SIZE byte chunks
					var chunk = 0
					for(var key in Iterator(ds.allocateIds(parent, "original", Math.ceil(photo.length / MAX_SIZE)).iterator())) {
						var entity = new Entity(key)
						var l = Math.min(photo.length - chunk * MAX_SIZE, MAX_SIZE)
						var b = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, l)
						java.lang.System.arraycopy(photo, chunk * MAX_SIZE, b, 0, l)
						entity.setProperty("data", new Blob(b))
						ds.put(entity)

						model.original.push(KeyFactory.keyToString(key))
						chunk++
					}

					// resize the original for a preview image
					photo = ImagesServiceFactory.makeImage(photo)
					if(photo.getWidth() > photo.getHeight()) {
						photo = is.applyTransform(ImagesServiceFactory.makeResize(370, photo.getHeight() * 370 / photo.getWidth()), photo)
					} else {
						photo = is.applyTransform(ImagesServiceFactory.makeResize(photo.getWidth() * 370 / photo.getHeight(), 370), photo)
					}

					var preview = ds.allocateIds(parent, "preview", 1).getStart()
					var entity = new Entity(preview)
					entity.setProperty("data", new Blob(photo.getImageData()))
					ds.put(entity)

					model.preview = [KeyFactory.keyToString(preview)]
				}

				var entity = new Entity(parent)
				entity.setProperty("data", new Text(model.toSource()))
				ds.put(entity)

				invalidateCache(KeyFactory.keyToString(parent), model.tags)

				// rebuild the index 
				queue.add(TaskOptions.Builder.url("/_tasks/buildIndex"))	

				transaction.commit()
				return model 
			} catch(e) {
				log.severe(e)
				log.severe("rolling back")
				transaction.rollback()

				throw e
			}
		},
		remove: function(key) {
			var transaction = ds.beginTransaction()
			try {
				var model = get(key) 
				removeImages(model.original)
				removeImages(model.preview)
				
				ds["delete"](KeyFactory.stringToKey(key))

				invalidateCache(key, model.tags)

				// rebuild index
				queue.add(TaskOptions.Builder.url("/_tasks/buildIndex"))	

				transaction.commit()
			} catch(e) {
				log.severe(e)
				log.severe("rolling back")
				transaction.rollback()

				throw e
			}
		}
	}
})
