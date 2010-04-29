(function() {
	importPackage(com.google.appengine.api.datastore, com.google.appengine.api.memcache, Packages.twitter4j, Packages.twitter4j.http)
	
	var ds = DatastoreServiceFactory.getDatastoreService()
	var cache = MemcacheServiceFactory.getMemcacheService()

	return {
		buildIndex: function() {
			log.info("rebuilding index")

			var mapping = new Object()
			var index = new Object()
			for(var e in Iterator(ds.prepare(new Query("posts")).asIterator())) {
				var model = eval(e.getProperty("data").getValue())
				var key = e.getKey().getId()
				mapping[key] = KeyFactory.keyToString(e.getKey()) 

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

			log.info("mapping: " + mapping.toSource())
			log.info("index: " + index.toSource())

			// remove old ones
			for(var e in Iterator(ds.prepare(new Query("meta")).asIterator())) {
				ds["delete"](e.getKey())
				cache["delete"](e.getKey().getName())
			}
			cache["delete"]("_mapping")
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

			entity = new Entity(KeyFactory.createKey("meta", "_mapping"))
			entity.setProperty("data", new Text(mapping.toSource()))
			ds.put(entity)
			
			return ["ok", "ok"]
		},
		tweet: function() {
			var twitter = new TwitterFactory().getInstance()
			twitter.setOAuthConsumer(config.twitterconsumerkey, config.twitterconsumersecret)
			twitter.setOAuthAccessToken(new AccessToken(config.twitteraccesstoken, config.twitteraccesstokensecret))
			twitter.updateStatus("hello world")

			return ["ok", "ok"]
		}
	}
})

