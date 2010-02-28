(function(ds) {
	require("utils/common.js")
		
	function get(key) {
		return ds.get(key)
	}
	
	function persist(key, title, path, tags) {
		ds.transaction(function(ds) {
			// split the tags into an array and ensure we have the "all" tag
			tags = tags != null && tags.trim().length > 0 ? tags.trim().toLowerCase().split(" ") : new Array()
			if(tags.indexOf("all") == -1) tags.push("all")
		
			if(key == null || key == undefined) {
				ds.update("INSERT INTO posts (title, timestamp) VALUES('" + escape(title) + "','" + new Date().toGMTString() + "')")
				ds.query("SELECT last_insert_rowid() AS id", function(rs) {
					log.info("getting key")
					if(rs.next()) key = rs.getInt("id")
					else throw "impossible exception"
				})
								
				tags.forEach(function(tag) {
					log.info(tag + ":" + key)
					ds.update("INSERT INTO tags (name, post) VALUES('" + escape(tag) + "'," + key + ")")
				})
				
				try { shell("mkdir public/blog/" + key) } catch(e) {}
				
				log.info("new model: " + key)
			} else {
				ds.update("UPDATE posts SET title='" + escape(title) + "',timestamp='" + new Date().toGMTString() + "' WHERE id=" + key)
				ds.update("DELETE from tags WHERE post=" + key)
				tags.forEach(function(tag) {
					ds.update("INSERT INTO tags (name, post) VALUES('" + escape(tag) + "'," + key + ")")
				})
			}
			
			if(path != null && path != undefined && path.length > 0) {
				log.info("using picture: " + path)
				var newPath = "public/blog/" + key;
				try { shell("rm " + newPath + "/*") } catch(e) {}
								
				convert(path, newPath + "/o.jpg")
				shell("rm " + path)
				
				// create preview
				resize(newPath + "/o.jpg", newPath + "/p.jpg", 370)
			}
		})	

		return {
			key: key,
			tags: tags,
			title: title,
			date: new Date().toDateString()
		}
	}
	
	function remove(key) {
		ds.transaction(function(ds) {
			ds.update("DELETE from tags WHERE post=" + key)
			ds.update("DELETE from posts WHERE id=" + key)
			try {shell("rm -rf public/blog/" + key) } catch(e) {}
		})
	}
	
	return {
		get: get,
		persist: persist,
		remove: remove
	}
})
