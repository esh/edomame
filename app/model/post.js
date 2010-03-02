(function(ds) {
	require("utils/common.js")
	
	var MAX_SIZE = 1000*1000
	
	function get(key) {
		return ds.get(key)
	}
	
	function persist(key, title, tags, photo) {
		var model
		ds.transaction(function(ds) {
			var original = new Array()
			var preview = new Array()
			var thumb = new Array()
			if(photo) {
				// save the original by splitting into MAX_SIZE byte chunks
				for(var chunk = 0 ; chunk < Math.ceil(photo.length / MAX_SIZE) ; chunk++) {
					var b = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, Math.min(photo.length - chunk * MAX_SIZE, MAX_SIZE))
					for(var i = chunk * MAX_SIZE, j = 0 ; i < Math.min((chunk + 1) * MAX_SIZE, photo.length) ; i++, j++) {
						b[j] = photo[i]
					}	
					original.push(ds.put("original", b))	
				}
			}

			// split the tags into an array and ensure we have the "all" tag
			tags = tags != null && tags.trim().length > 0 ? tags.trim().toLowerCase().split(" ") : new Array()
			if(tags.indexOf("all") == -1) tags.push("all")
			model = {
				title: title,
				tags: tags,
				timestamp: new Date(),
				original: original,
				preview: preview,
				thumb: thumb
			}
	
			if(key == null || key == undefined) {
				key = ds.put("posts", model)
				model.key = key
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
