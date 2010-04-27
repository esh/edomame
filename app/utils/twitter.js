require("utils/common.js")

function notify_twitter(model) {
	var auth = config.twitteruser + ":" + config.twitterpass
	auth = "Basic " + auth.toBase64()

	var status = "http://edomame.com/" + model.key + " - " + model.title
	if(status.length > 140) status.substring(0, 137) + "..."

	hpost("http://twitter.com/statuses/update.json", {"Authorization": auth}, "status=" + status.escapeURL())
}
