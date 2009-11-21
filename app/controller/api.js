(function() {
	function secure(fn) {
		if(request.authorization == "esh:" + config.sitepass) return fn()
		else return ["unauthorized"]
	}

        function deploy() {
                if(request.hostname.match(/(github.com)|(engineyard.com)/)) {
                        log.info("redeploying...")
                        try { log.info(shell("./scripts/deploy.local.sh")) } catch(e) {}
                        return ["ok", ""]
                } else {
                        log.info("blocked deploy request from: " + request.hostname)
                        return ["unauthorized"]
                }
        }
	
	function create() {
		return secure(function() {
			with(eval(request.content)) {
				if(title != undefined && photo != undefined) {
					var path = "/tmp/" + Math.floor(Math.random() * 100000) + "." + ext
					log.info("api create: " + title + " => " + path)
										
					open(path, "base64").write(photo)
					var post = require("model/post.js")(db).persist(null, title, path, tags)
					
					if(post.tags.indexOf("tweet") != -1) {					
						require("utils/twitter.js")
						notify_twitter(post, twit)
					}
	
					return ["ok", "ok"]
				} else {
					return ["ok", "missing title or photo"]
				}
			}
		})
	}
	
	return {
		deploy: deploy,	
		create: create
	}
})

