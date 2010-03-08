(function() {
	importPackage(com.google.appengine.api.labs.taskqueue)

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
	
	function remove(key) {
		return secure(function() {
			post.remove(key)
			return show()
		})
	}

	function save() {
		var p = {
			key: request.params["key"],
			title: request.params["title"],
			tags: request.params["tags"]
		}

		var queue = QueueFactory.getQueue("post-queue")
		queue.add(TaskOptions.url("/blog/process").payload(new java.lang.String(p.toSource()).getBytes(), "application/json"))

		return ["redirect", "/"]
	}

	function process() {
		var twit = request.params["key"] == null
		var p = eval(request.content)
		p = post.persist(p.key, p.title, p.tags)
				
		if(twit && p.tags.indexOf("tweet") != -1) {	
			require("utils/twitter.js")
			notify_twitter(p)
		}
		
		return ["ok", "ok"]
	}

	return {
		show: show,
		detail: detail,
		image: image,
		edit: edit,
		remove: remove,
		create: create,
		save: save,
		process: process
	}
})
