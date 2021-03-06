(function() {
	return {
		show: function(request, response, session) {
			require("utils/common.js")
			var post = require("model/post.js")()
			var keys = require("model/tagset.js")().get("all").slice(-16)
			return ["ok", "<?rss version=\"1.0\"?>\n" + 
				keys.map(function(key) {
					var p = post.get(key)
					return  <item>
							<title>{p.title}</title>
							<description>{p.title}</description>
							<link>http://www.edomame.com/all/{p.key}</link>
							<pubDate>{p.date}</pubDate>
							<guid>{p.key}</guid>
						</item>
					}).reduce(
					<rss version="2.0">
						<channel>
							<title>Edomame - a photo blog of Ed&apos;s adventures</title>
							<description>various captioned pictures from Ed</description>
							<link>http://www.edomame.com</link>
						</channel>
					</rss>, 
					function(rss, post) {
						rss.channel.item += post
						return rss
					}), "application/rss+xml"]
		}
	}
})

