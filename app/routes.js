(function(url) {
        if(url.match(/^\/blog/) || url.match(/^\/admin/) || url.match(/^\/api/) || url.match(/^\/rss/)) return url

        if(url.match(/^\/[a-zA-Z0-9]+$/)) return "/blog/show/all"

        var res = url.match(/^(\/[a-zA-Z]+)(\/[a-zA-Z0-9]+)?$/)
        if(res != null && res[1] != null) return "/blog/show" + res[1]

        return url
})

