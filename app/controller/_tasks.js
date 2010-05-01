(function() {
	importPackage(com.google.appengine.api.datastore, com.google.appengine.api.memcache, Packages.twitter4j, Packages.twitter4j.http)

	var ds = DatastoreServiceFactory.getDatastoreService()
	var cache = MemcacheServiceFactory.getMemcacheService()

	return {
		buildIndex: function() {
			log.info("rebuilding index")
			var mapping = new Object()
			var index = new Object()
			var from = 0

			if(request.params.buildIndex != null) {
				mapping = eval(request.params.buildIndex.mapping)
				index = eval(request.params.buildIndex.index)
				from = eval(request.params.buildIndex.from)
			}

			var query = ds.prepare(new com.google.appengine.api.datastore.Query("posts")
					.addFilter(
						"__id__",
						com.google.appengine.api.datastore.Query.FilterOperator.GREATER_THAN_OR_EQUAL,
						from))

			for(var e in Iterator(query.asIterator())) {
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

			log.info("from: " + from)
			log.info("mapping: " + mapping.toSource())
			log.info("index: " + index.toSource())


			var tags = new Array()
			for(var tag in index) {
				tags.push(tag)

				var entity = new Entity(KeyFactory.createKey("meta", tag))
				entity.setProperty("data", new Text(index[tag].sort(function(a, b) { return a.date - b.date }).map(function(e) { return e.key }).toSource()))
				ds.put(entity)
			}

			// remove old ones
			for(var e in Iterator(ds.prepare(new com.google.appengine.api.datastore.Query("meta")).asIterator())) {
				ds["delete"](e.getKey())
				cache["delete"](e.getKey().getName())
			}
			cache["delete"]("_mapping")
			cache["delete"]("_tags")

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
		
			var model = eval(request.params.model)
			var url = " http://www.edomame.com/" + model.key
			if(model.title.length + url.length > 140) {
				model.title = model.title.substring(0, 140 - url.length - 3) + "..."
			}

			log.info("tweeting: " + model.title + url) 
			twitter.updateStatus(model.title + url)

			return ["ok", "ok"]
		}
	}
})

