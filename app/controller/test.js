(function() {
	function dw(arg) {
		var key
		ds.transaction(function(ds) {
			key = ds.put("test", {hello: arg})
		})

		return ["ok", key] 
	}

	function df() {
		return ["ok", ds.find("test").toSource()]
	}

	function dg(arg) {
		return ["ok", ds.get(arg).toSource()]
	}

	return {
		show: function() {
			return ["ok", "hello world"]
		},
		dw: dw,
		dg: dg,
		df: df
	}
})
