(function() {
	require("utils/common.js")
	importPackage(com.google.appengine.api.datastore)
	importPackage(com.google.appengine.api.images)
	importPackage(org.apache.commons.codec.binary)

	var ds = DatastoreServiceFactory.getDatastoreService()
	var is = ImagesServiceFactory.getImagesService()
	
	var MAX_SIZE = 1000*1000

	function transaction(fn) {

			var res = fn()
	}

	function removeImages(keys) {
		keys.forEach(function(e) {
			ds["delete"](KeyFactory.stringToKey(e))
		})
	}

	function get(key) {
		return eval(ds.get(KeyFactory.stringToKey(key)).getProperty("data").getValue())
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
			
				model.title = title
				model.tags = tags
				model.timestamp = timestamp ? new Date(timestamp) : new Date()
		
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
					photo = is.applyTransform(ImagesServiceFactory.makeResize(370, photo.getHeight() * photo.getWidth() / 370), photo)
					var preview = ds.allocateIds(parent, "preview", 1).getStart()
					var entity = new Entity(preview)
					entity.setProperty("data", new Blob(photo.getImageData()))
					ds.put(entity)

					model.preview = [KeyFactory.keyToString(preview)]
				}

				var entity = new Entity(parent)
				entity.setProperty("data", new Text(model.toSource()))
				ds.put(entity)

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
				var key = KeyFactory.stringToKey(key)
				var model = eval(ds.get(key))

				removeImages(model.original)
				removeImages(model.preview)

				ds["delete"](key)

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
