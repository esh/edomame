(function() {
	importPackage(com.google.appengine.api.datastore, com.google.appengine.api.labs.taskqueue, com.google.appengine.api.memcache, Packages.twitter4j, Packages.twitter4j.http)

	var ds = DatastoreServiceFactory.getDatastoreService()
	var queue = QueueFactory.getQueue("tasks")
	var cache = MemcacheServiceFactory.getMemcacheService()


	// temp
	importPackage(com.google.appengine.api.files, com.google.appengine.api.images, com.google.appengine.api.blobstore, java.nio)
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
				var t = eval(request.params.buildIndex)
				index = t.index
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
				log.info("continuing index build...")
				queue.add(TaskOptions.Builder.url("/_tasks/buildIndex").param("buildIndex", ({
					index: index,
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
		migrateImg: function(request, response, session) {
			log.info("migrating: " + request.params.key)
			var p = post.get(request.params.key)
			var blobkey = new BlobKey(p.images.preview)
			log.info("blobkey: " + blobkey)
			var info = bi.loadBlobInfo(blobkey)
			log.info("blobinfo: " + info)
			log.info("size: " + info.getSize())
			var gphoto = ImagesServiceFactory.makeImage(bs.fetchData(blobkey, 0, info.getSize() - 1))
			log.info("made image")

			// resize the original for a preview image
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

			var thumb = fs.createNewBlobFile("image/jpg", "t_" + p.key)
			var writeChannel = fs.openWriteChannel(thumb, true)
			writeChannel.write(ByteBuffer.wrap(gphoto.getImageData()))
			writeChannel.closeFinally()
			p.images.thumb = fs.getBlobKey(thumb).getKeyString()

			var transaction = ds.beginTransaction()
			try {
				var entity = new Entity(KeyFactory.createKey("posts", parseInt(request.params.key)))
				log.info("saving: " + p.toSource())
				entity.setProperty("data", new Text(p.toSource()))
				ds.put(entity)

				transaction.commit()
			} catch(e) {
				log.severe(e)
				log.severe("rolling back")
				transaction.rollback()

				throw e
			}

			return ["ok", "ok"]
		}
	}
})

