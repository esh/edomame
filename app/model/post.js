(function() {
	require("utils/common.js")
	importPackage(com.google.appengine.api.datastore, com.google.appengine.api.memcache, com.google.appengine.api.blobstore, com.google.appengine.api.labs.taskqueue, com.google.appengine.api.images, com.google.appengine.api.files, java.nio, org.apache.sanselan, org.apache.sanselan.formats.tiff.constants)

	var fs = FileServiceFactory.getFileService()
	var bs = BlobstoreServiceFactory.getBlobstoreService()
	var ds = DatastoreServiceFactory.getDatastoreService()
	var cache = MemcacheServiceFactory.getMemcacheService()
	var is = ImagesServiceFactory.getImagesService()
	var queue = QueueFactory.getQueue("tasks")

	function removeImages(key) {
		bs["delete"](new BlobKey(key))
	}

	function get(key) {
		var model = cache.get(key)
		if(model == null) {
			log.info("cache miss: " + key) 
			model = ds.get(KeyFactory.createKey("posts", parseInt(key))).getProperty("data").getValue()
			cache.put(key, model)
		}
		
		model = eval(model)
		model.key = key
		return model
	}

	return {
		get: get,
		persist: function(key, title, tags, photo, ext, timestamp) {
			var transaction = ds.beginTransaction()
			try {
				log.info("key:" + key + " title:" + title + " tags:" + tags)
				var parent
				var model

				if(key) {
					parent = KeyFactory.createKey("posts", parseInt(key))
					model = get(key)
					log.info("existing model: " + model.toSource()) 
				} else {
					parent = ds.allocateIds("posts", 1).getStart()
					model = new Object()
					model.images = new Object()
					model.date = timestamp ? new Date(timestamp) : new Date()
				}

				// split the tags into an array and ensure we have the "all" tag
				tags = tags != null && tags.trim().length > 0 ? tags.trim().toLowerCase().split(" ") : new Array()
				if(tags.indexOf("all") == -1) tags.push("all")

				model.key = parent.getId()	
				model.title = title
				model.tags = tags

				if(photo && ext) {
					ext = ext.toLowerCase()
					log.info("got photo of ext:" + ext)
					
					var gphoto = ImagesServiceFactory.makeImage(photo)
					// handle orientation
					if(ext == "jpg" || ext == "jpeg") {
						var metadata = Sanselan.getMetadata(photo)
						var orientation = metadata.findEXIFValue(ExifTagConstants.EXIF_TAG_ORIENTATION)
						orientation = orientation == null ? 1 : orientation.getIntValue()
						log.info("orientation: " + orientation)
				
						if(orientation == 3) {
							gphoto = is.applyTransform(ImagesServiceFactory.makeRotate(180), gphoto)
						} else if(orientation == 6) {
							gphoto = is.applyTransform(ImagesServiceFactory.makeRotate(90), gphoto)
						} else if(orientation == 8) {
							gphoto = is.applyTransform(ImagesServiceFactory.makeRotate(270), gphoto)
						} 
					}

					var original = fs.createNewBlobFile("image/" + ext, "o_" + parent.getId())
					var writeChannel = fs.openWriteChannel(original, true)
					writeChannel.write(ByteBuffer.wrap(gphoto.getImageData()))
					writeChannel.closeFinally()
					model.images.original  = fs.getBlobKey(original).getKeyString()
				}

				log.info("saving: " + model.toSource())
				var entity = new Entity(parent)
				entity.setProperty("data", new Text(model.toSource()))
				ds.put(entity)

				cache["delete"](String(model.key))

				transaction.commit()

				// process the pics 
				if(photo) {
					queue.add(TaskOptions.Builder.url("/_tasks/processPost").param("key", model.key))	
				}

				// rebuild index
				queue.add(TaskOptions.Builder.url("/_tasks/buildIndex"))	
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
				removeImages(model.images.original)
				removeImages(model.images.preview)
				
				ds["delete"](KeyFactory.createKey("posts", parseInt(key)))
				cache["delete"](key)

				transaction.commit()

				// rebuild index
				queue.add(TaskOptions.Builder.url("/_tasks/buildIndex"))
			} catch(e) {
				log.severe(e)
				log.severe("rolling back")
				transaction.rollback()

				throw e
			}
		}
	}
})
