(function() {
	require("utils/common.js")
	importPackage(org.apache.commons.io)

	return {
		mail: function(address) {
			var mail = request.mail
			mail.getFrom().forEach(function(from) {
				log.info("FROM: " + from)
			})

			log.info("MAIL TYPE:" + mail.getContentType())
			var title = mail.getSubject().trim()	
			var photo
			var tags

			var multipart = mail.getContent();
			for(var i = 0 ; i < multipart.getCount() ; i++) {
				var part = multipart.getBodyPart(i)
				log.info("PART TYPE:" + part.getContentType())
				if(part.getContentType().match(/text/)) {
					tags = part.getContent().trim()
				} else if(part.getContentType().match(/image/)) {
					photo = IOUtils.toByteArray(part.getInputStream())
				}	
			}
			
			if(tags == null) {
				tags = ""
			}

			log.info(title + " " + photo + " " + tags)

			return ["ok", "ok"]
		}
	}
})
