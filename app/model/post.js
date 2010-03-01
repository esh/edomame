(function(ds) {
	require("utils/common.js")
		
	function get(key) {
		return ds.get(key)
	}
	
	function persist(key, title, path, tags) {
		var model
		ds.transaction(function(ds) {
			// split the tags into an array and ensure we have the "all" tag
			tags = tags != null && tags.trim().length > 0 ? tags.trim().toLowerCase().split(" ") : new Array()
			if(tags.indexOf("all") == -1) tags.push("all")
			model = {
				title: title,
				tags: tags,
				timestamp: new Date()
			}
	
			if(key == null || key == undefined) {
				key = ds.put("posts", model)
				log.info("new model: " + key)
			} 

			ds.update(key, model)

			// create preview
			// resize(newPath + "/o.jpg", newPath + "/p.jpg", 370)
		})	

		return model 
	}
	
	function remove(key) {
		ds.remove(key)
	}
	
	return {
		get: get,
		persist: persist,
		remove: remove
	}
})
