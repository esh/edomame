require("utils/common.js")

function tweet(model) {
	var auth = config.twitteruser + ":" + config.twitterpass
	auth = "Basic " + auth.toBase64()
	
	var h = hopen("http://twitter.com/statuses/update.json", {"Authorization": auth})
	
	var status = "http://www.edomame.com/all/" + model.key + " - " + model.title
	if(status.length > 140) status.substring(0, 137) + "..."
	
	h.write("status=" + status.escapeURL())

	log.debug(h.read())
}

function direct(user, msg) {
	var auth = config.twitteruser + ":" + config.twitterpass
	auth = "Basic " + auth.toBase64()
	
	var h = hopen("http://twitter.com/direct_messages/new.json", {"Authorization": auth})
	
	if(msg.length > 140) msg.substring(0, 137) + "..."
	
	h.write("user=" + user + "&text=" + msg.escapeURL())

	log.debug(h.read())
}

function createlist(model) {
	direct("listous", "http://www.edomame.com/all/" + model.key)
}
