require("utils/common.js")

function notify_twitter(model, tweet) {
	function reliable(url, params, msg) {
		// retry every minute for 1 hour until success or failure
		for(var i = 0 ; i < 60 ; i++) {	
			try {
				var h = hopen(url, params)
				h.write(msg)
				return h.read()
			} catch(e) {
				log.error(e)
				sleep(1000)
			}
		}
	}

	var auth = "Basic " + (config.twitteruser + ":" + config.twitterpass).toBase64()

	if(tweet) {	
		var status = "http://edomame.com/" + model.key + " - " + model.title
		if(status.length > 140) status.substring(0, 137) + "..."

		log.debug(reliable("http://twitter.com/statuses/update.json", {"Authorization": auth}, "status=" + status.escapeURL()))
	}
	
	log.debug(reliable("http://twitter.com/direct_messages/new.json", {"Authorization": auth}, "user=listous&text=" + "http://edomame.com/" + model.key)) 
}
