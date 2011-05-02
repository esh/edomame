(function() {
	importPackage(com.google.appengine.api.datastore, com.google.appengine.api.labs.taskqueue, com.google.appengine.api.memcache, Packages.twitter4j, Packages.twitter4j.http)
	importPackage(com.google.appengine.api.files, com.google.appengine.api.images, com.google.appengine.api.blobstore, java.nio)

	var ds = DatastoreServiceFactory.getDatastoreService()
	var queue = QueueFactory.getQueue("tasks")
	var cache = MemcacheServiceFactory.getMemcacheService()
	var fs = FileServiceFactory.getFileService()
	var is = ImagesServiceFactory.getImagesService()
	var bs = BlobstoreServiceFactory.getBlobstoreService()
	var bi = new BlobInfoFactory()

	var post = require("model/post.js")()

	return {
		buildIndex: function(request, response, session) {
			log.info("rebuilding index")
			var index = { all:[] } 
			var from = null

			if(request.params.buildIndex != null) {
				index = eval(ds.get(KeyFactory.createKey("meta", "_index")).getProperty("data").getValue())
				var t = eval(request.params.buildIndex)
				from = KeyFactory.stringToKey(t.from)
			} 

			var query = new com.google.appengine.api.datastore.Query("posts").addSort("__key__")
			if(from) {
				query = query.addFilter("__key__", com.google.appengine.api.datastore.Query.FilterOperator.GREATER_THAN, from)
			}
			query = ds.prepare(query)
			for(var e in Iterator(query.asIterator())) {
				var model = eval(e.getProperty("data").getValue())
				var key = e.getKey().getId()
				
				from = KeyFactory.keyToString(e.getKey())

				model.tags.forEach(function(tag) {
					if(!(tag in index)) {
						index[tag] = []
					}

					index[tag].push({
						key: key,
						date: model.date
					})
				})
			}

			log.info("count: " + query.countEntities())

			if(query.countEntities() < 1000) {
				// remove old ones
				ds["delete"](KeyFactory.createKey("meta", "_index"))
				for(var e in Iterator(ds.prepare(new com.google.appengine.api.datastore.Query("meta")).asIterator())) {
					ds["delete"](e.getKey())
					cache["delete"](e.getKey().getName())
				}
				cache["delete"]("_tags")

				var tags = new Array()
				for(var tag in index) {
					tags.push(tag)

					var entity = new Entity(KeyFactory.createKey("meta", tag))
					entity.setProperty("data", new Text(index[tag].sort(function(a, b) { return a.date - b.date }).map(function(e) { return e.key }).toSource()))
					ds.put(entity)
				}

				
				// save down the entire set
				var entity = new Entity(KeyFactory.createKey("meta", "_tags"))
				entity.setProperty("data", new Text(tags.sort().toSource()))
				ds.put(entity)

				log.info("index built")
			} else {
				log.info("continuing index build from " + from)
				var entity = new Entity(KeyFactory.createKey("meta", "_index"))
				entity.setProperty("data", new Text(index.toSource()))
				ds.put(entity)

				queue.add(TaskOptions.Builder.url("/_tasks/buildIndex").param("buildIndex", ({
					from: from				
				}).toSource()))
			}
	
			return ["ok", "ok"]
		},
		tweet: function(request, response, session) {
			var twitter = new TwitterFactory().getInstance()
			twitter.setOAuthConsumer(config.twitterconsumerkey, config.twitterconsumersecret)
			twitter.setOAuthAccessToken(new AccessToken(config.twitteraccesstoken, config.twitteraccesstokensecret))
		
			var model = eval(request.params.model)
			var url = " http://www.edomame.com/" + model.key
			if(model.title.length + url.length > 140) {
				model.title = model.title.substring(0, 140 - url.length - 3) + "..."
			}

			log.info("tweeting: " + model.title + url) 
			twitter.updateStatus(model.title + url)

			return ["ok", "ok"]
		},
		processPost: function(request, response, session) {
			log.info("processing: " + request.params.key)
			var p = post.get(request.params.key)
			var blobkey = new BlobKey(p.images.original)
			var info = bi.loadBlobInfo(blobkey)
			log.info("blobinfo: " + info)
			log.info("size: " + info.getSize())
			var MAX_SIZE = 512000
			var imageData = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, info.getSize())
			var imageDataBuffer = ByteBuffer.wrap(imageData)
			for(var i = 0 ; i < Math.ceil(info.getSize() / MAX_SIZE) ; i++) {
				imageDataBuffer.put(bs.fetchData(blobkey, i * MAX_SIZE, i * MAX_SIZE + Math.min(imageData.length - i * MAX_SIZE, MAX_SIZE) - 1))
			}
			var gphoto = ImagesServiceFactory.makeImage(imageData)
			log.info("loaded image")

			// resize the original for a preview image
			if(gphoto.getWidth() > gphoto.getHeight()) {
				gphoto = is.applyTransform(ImagesServiceFactory.makeResize(370, gphoto.getHeight() * 370 / gphoto.getWidth()), gphoto)
			} else {
				gphoto = is.applyTransform(ImagesServiceFactory.makeResize(gphoto.getWidth() * 370 / gphoto.getHeight(), 370), gphoto)
			}

			var preview = fs.createNewBlobFile(info.getContentType(), "p_" + p.key)
			var writeChannel = fs.openWriteChannel(preview, true)
			writeChannel.write(ByteBuffer.wrap(gphoto.getImageData()))
			writeChannel.closeFinally()
			p.images.preview = fs.getBlobKey(preview).getKeyString()

			// resize the original for a thumb image
			if(gphoto.getWidth() > gphoto.getHeight()) {
				gphoto = is.applyTransform(ImagesServiceFactory.makeResize(gphoto.getWidth() * 84 / gphoto.getHeight(), 84), gphoto)
				var lo = (gphoto.getWidth() - 84) / 2
				log.info("land: " + gphoto.getWidth() + "x" + gphoto.getHeight() + " " + lo)
				gphoto = is.applyTransform(ImagesServiceFactory.makeCrop(lo / gphoto.getWidth(), 0, (lo + 84) / gphoto.getWidth(), 1.0), gphoto)
			} else {
				gphoto = is.applyTransform(ImagesServiceFactory.makeResize(84, gphoto.getHeight() * 84 / gphoto.getWidth()), gphoto)
				var uo = (gphoto.getHeight() - 84) / 2
				log.info("port: " + gphoto.getWidth() + "x" + gphoto.getHeight() + " " + uo)
				gphoto = is.applyTransform(ImagesServiceFactory.makeCrop(0, uo / gphoto.getHeight(), 1.0, (uo + 84) / gphoto.getHeight()), gphoto)
			}

			var thumb = fs.createNewBlobFile(info.getContentType(), "t_" + p.key)
			writeChannel = fs.openWriteChannel(thumb, true)
			writeChannel.write(ByteBuffer.wrap(gphoto.getImageData()))
			writeChannel.closeFinally()
			p.images.thumb = fs.getBlobKey(thumb).getKeyString()

			var transaction = ds.beginTransaction()
			try {
				var entity = new Entity(KeyFactory.createKey("posts", parseInt(p.key)))
				log.info("saving: " + p.toSource())
				entity.setProperty("data", new Text(p.toSource()))
				ds.put(entity)
				cache["delete"](String(p.key))
				transaction.commit()
			} catch(e) {
				log.severe(e)
				log.severe("rolling back")
				transaction.rollback()

				if(preview) {
					bs["delete"](fs.getBlobKey(preview))
				}

				if(thumb) {
					bs["delete"](fs.getBlobKey(thumb))
				}

				throw e
			}

			return ["ok", "ok"]
		}
	}
})

