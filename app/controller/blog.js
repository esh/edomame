(function() {
	var post = require("model/post.js")()
	var tagset = require("model/tagset.js")()
	var tags = require("model/tags.js")()
	var img = require("model/image.js")()

	function secure(fn) {
		if(session["authorized"]) return fn()
		else return ["unauthorized"]
	}
			
	function detail(key) {
		return ["ok", post.get(key).toSource()]
	}

	function image(type, key) {
		if(type == "original" || type == "preview") {
			var p = post.get(key)
			return ["ok", img.get(p[type]), "image/" + p.ext]
		} else {
			return ["error", "invalid type"]
		}
	}

	function show(type) {
		var type = (type == undefined || type == "") ? "all" : type
		return ["ok", render(
				"view/blog/show.jhtml",
				{ 
					type: type, 
					keys: tagset.get(type),
					cloud: tags.get(),
					admin: session["authorized"] == true
				})]
	}
	
	function create() {
		return secure(function() {	
			return ["ok", render("view/blog/form.jhtml", new Object())]
		})
	}

	function edit(key) {
		return secure(function() {
			var p = post.get(key)
			p.key = key
			p.tags = p.tags.join(" ")
			
			return ["ok", render("view/blog/form.jhtml", p)]
		})
	}
	
	function save() {
		return secure(function() {
			var twit = request.params["key"] == null
			var p = post.persist(request.params["key"], request.params["title"], request.params["tags"])
					
			if(twit && p.tags.indexOf("tweet") != -1) {	
				require("utils/twitter.js")
				notify_twitter(p)
			}
			
			return ["redirect", "/" + request.params["key"]]
		})
	}
	
	function remove(key) {
		return secure(function() {
			post.remove(key)
			return ["redirect", "/"] 
		})
	}
	
	return {
		show: show,
		detail: detail,
		image: image,
		edit: edit,
		remove: remove,
		create: create,
		save: save
	}
})
