(function(ds) {
	return {
		get: function(tag) {
			return ds.find(tag).map(function(e) {
				return e.key	
			})
		}
	}
})
