(function() {
	importPackage(com.google.appengine.api.labs.taskqueue)

	var queue = QueueFactory.getQueue("tasks")
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

	function show(a, b) {
		log.info("show: " + a + " " + b)
		var type = "all"
		var p

		if(a != undefined && isNaN(a)) {
			type = a
		}
		if(a != undefined && !isNaN(a)) {
			p = post.get(a)
		} else if(b != undefined && !isNaN(b)) {
			p = post.get(b) 
		}

		return ["ok", render(
				"view/blog/show.jhtml",
				{ 
					type: type, 
					keys: tagset.get(type),
					cloud: tags.get(),
					post: p,
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
				queue.add(TaskOptions.Builder.url("/_tasks/tweet").param("model", p.toSource()))
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
