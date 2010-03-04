(function(ds) {
	require("utils/common.js")
	
	var MAX_SIZE = 1000*1000
	
	function get(key) {
		return ds.get(key)
	}
	
	function persist(key, title, tags, photo) {
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
				model.key = key
				log.info("new model: " + key)
			}

			ds.root(key)

			if(photo) {
				model.original = new Array()
				// save the original by splitting into MAX_SIZE byte chunks
				for(var chunk = 0 ; chunk < Math.ceil(photo.length / MAX_SIZE) ; chunk++) {
					model.original.push(ds.put("original", photo.slice(chunk * MAX_SIZE, Math.min((chunk + 1) * MAX_SIZE, photo.length))))
				}
			}

			ds.update(key, model)

			// create preview
			// resize(newPath + "/o.jpg", newPath + "/p.jpg", 370)
		})	

		return model 
	}
	
	function remove(key) {
		ds.transaction(function(ds) {
			ds.root(ds)
			var model = ds.get(key)
			model.original.forEach(function(e) {
				ds.remove(e)
			})
			ds.remove(key)
		})
	}
	
	return {
		get: get,
		persist: persist,
		remove: remove
	}
})
