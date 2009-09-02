require("utils/common.js")

function notify_twitter(model, tweet) {
	var auth = config.twitteruser + ":" + config.twitterpass
	auth = "Basic " + auth.toBase64()

	if(tweet) {	
		var h = hopen("http://twitter.com/statuses/update.json", {"Authorization": auth})
	
		var status = "http://www.edomame.com/all/" + model.key + " - " + model.title
		if(status.length > 140) status.substring(0, 137) + "..."

		try {	
			h.write("status=" + status.escapeURL())
			log.debug(h.read())
		} catch(e) {
			log.error(e)
		}
	}
	
	var h = hopen("http://twitter.com/direct_messages/new.json", {"Authorization": auth})

	try {	
		h.write("user=listous&text=" + "http://www.edomame.com/all/" + model.key) 
		log.debug(h.read())
	} catch(e) {
		log.error(e)
	}
}
