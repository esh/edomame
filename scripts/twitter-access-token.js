importPackage(java.io, java.lang, Packages.twitter4j)

var config = require("config.js")

function readLine() {
	return new BufferedReader(new InputStreamReader(System['in'])).readLine()
}


var twitter = new TwitterFactory().getInstance()
twitter.setOAuthConsumer(config.twitterconsumerkey, config.twitterconsumersecret)
var requestToken = twitter.getOAuthRequestToken()
log.info(requestToken.getAuthorizationURL())

var accessToken
while(accessToken == null) {
	var pin = readLine()
	if(pin.length > 0) {
		accessToken = twitter.getOAuthAccessToken(requestToken, pin)
	} else {
		accessToken = twitter.getOAuthAccessToken()
	}
}

log.info(accessToken.getToken())
log.info(accessToken.getTokenSecret())
