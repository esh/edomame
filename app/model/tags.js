(function(ds) {
	require("utils/common.js")
		
	return {
		get: function() {
			var tags = new Array()
			for(var t in ds.find("posts").reduce({}, function(hash, e) {
					e.tags.forEach(function(t) {
						hash[t] = 0
					})
					return hash	
				})) {
				tags.push(t)	
			}
			return tags.sort()
		}
	}
})
