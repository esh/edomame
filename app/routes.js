(function(url) {
	var res
        if(url.match(/^\/blog/) || url.match(/^\/api/) || url.match(/^\/rss/)) {
		return url
	} else if(url.match(/^\/[0-9]+$/)) {
		return "/blog/show/all" + url	
	} else if(url.match(/^\/([a-zA-Z]+)(\/[0-9]+)?$/)) {
		return "/blog/show" + url
	} else {
        	return url
	}
})
