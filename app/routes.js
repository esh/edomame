(function(url) {
	var res
        if(url.match(/^\/blog/) || url.match(/^\/admin/) || url.match(/^\/api/) || url.match(/^\/rss/)) {
		return url
	} else if(url.match(/^\/[a-zA-Z]+[0-9]+[a-zA-Z0-9]+$/)) {
		return "/blog/show/all"	
	} else if(res = url.match(/^\/([a-zA-Z]+)(\/[a-zA-Z0-9]+)?$/)) {
		return "/blog/show/" + res[1]
	} else {
        	return url
	}
})
