(function(url) {
	var res
        if(url.match(/^\/blog/) || url.match(/^\/api/) || url.match(/^\/rss/)) {
		return url
	} else if(url.match(/^\/[0-9]+$/)) {
		return "/blog/show/all"	
	} else if(res = url.match(/^\/([a-zA-Z]+)(\/[0-9]+)?$/)) {
		return "/blog/show/" + res[1]
	} else {
        	return url
	}
})
