(function() {
	require("utils/common.js")
	importPackage(org.apache.commons.io)

	return {
		mail: function(address) {
			var mail = request.mail
			mail.getFrom().forEach(function(from) {
				log.info("FROM: " + from)
			})

			var title = mail.getSubject().trim()	
			var photo
			var tags

			var multipart = mail.getContent();
			for(var i = 0 ; i < multipart.getCount() ; i++) {
				var part = multipart.getBodyPart(i)
				log.info("PART TYPE:" + part.getContentType())
				if(part.getContentType().matches(/text/)) {
					tags = part.getContent().trim().split(" ")
				} else if(part.getContentType().matches(/image/)) {
					photo = IOUtils.toByteArray(part.getInputStream())
				}	
			}

			log.info(title + " " + photo + " " + tags)

			return ["ok", "ok"]
		}
	}
})
