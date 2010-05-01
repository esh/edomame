(function() {
	require("utils/common.js")
	importPackage(com.google.appengine.api.labs.taskqueue)
	importPackage(org.apache.commons.io)

	var queue = QueueFactory.getQueue("tasks")
	
	return {
		mail: function(address) {
			var mail = request.mail
			mail.getFrom().forEach(function(from) {
				if(from.getAddress() == "chan@sikho.ca" && mail.getContentType().match(/multipart/)) {
					var title = mail.getSubject().trim()
					var ext	
					var photo
					var tags

					var multipart = mail.getContent();
					for(var i = 0 ; i < multipart.getCount() ; i++) {
						var part = multipart.getBodyPart(i)
						log.info("processing:" + part.getContentType())
						if(part.getContentType().match(/text/)) {
							tags = part.getContent().trim()
						} else if(part.getContentType().match(/image/)) {
							photo = IOUtils.toByteArray(part.getInputStream())
							ext = part.getFileName().split(".")
							ext = ext[ext.length - 1]
						}	
					}
					
					if(tags == null) {
						tags = ""
					}

					log.info("got mail: " + title + " " + photo + " " + tags + " " + ext)
					var post = require("model/post.js")().persist(null, title, tags, photo, ext)
					if(post.tags.indexOf("tweet") != -1) {					
						queue.add(TaskOptions.Builder.url("/_tasks/tweet").param("model", post.toSource()))
					}
				}
			})

			return ["ok", "ok"]
		}
	}
})
