(function(ds) {
	require("utils/common.js")
		
	return {
		get: function() {
			var tags = new Array()
			for(var t in ds.find("all")
					.map(function(e) {
						return e.tags
					})
					.reduce({}, function(tags, e) {
						tags[e] = 0	
					})) {
				tags.push(t)	
			}

			return tags 
		}
	}
})
