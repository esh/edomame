(function() {
	importPackage(com.google.appengine.api.datastore, com.google.appengine.api.labs.taskqueue, com.google.appengine.api.memcache, Packages.twitter4j, Packages.twitter4j.http)

	var ds = DatastoreServiceFactory.getDatastoreService()
	var queue = QueueFactory.getQueue("tasks")
	var cache = MemcacheServiceFactory.getMemcacheService()

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
		}
	}
})

