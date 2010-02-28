(function() {
	function sw(arg) {
		session["key"] = arg 
		return ["ok", arg]
	}
	
	function sr() {
		return ["ok", session["key"]] 
	}

	return {
		show: function() {
			return ["ok", "hello world"]
		},
		sr: sr,
		sw: sw
	}
})
