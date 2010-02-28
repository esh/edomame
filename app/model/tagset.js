(function(ds) {
	return {
		get: function(tag) {
			return ds.find("posts")
				.filter(function(e) {
					return e.tags.indexOf(tag) != 0
				})
				.map(function(e) {
					return e.key	
				})
		}
	}
})
