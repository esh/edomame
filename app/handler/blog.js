(function() {
	importPackage(com.google.appengine.api.labs.taskqueue)

	var queue = QueueFactory.getQueue("tasks")
	var post = require("model/post.js")()
	var tagset = require("model/tagset.js")()
	var tags = require("model/tags.js")()
	var img = require("model/image.js")()

	require("utils/common.js")

	function secure(session, fn) {
		if(session["authorized"]) return fn()
		else return ["unauthorized"]
	}
			
	function detail(request, response, session) {
		return ["ok", post.get(request.args[0]).toSource()]
	}

	function image(type, request, response, session) {
		var p = post.get(request.args[0])
		return ["ok", img.get(p[type]), "image/" + p.ext]
	}

	function show(request, response, session) {
		log.info("show: " + request.args.toSource())
		var type = "all"
		var p

		if(request.args.length == 1 && isNaN(request.args[0])) {
			type = request.args[0]
		} else if(request.args.length == 1 && !isNaN(request.args[0])) {
			p = post.get(request.args[0])
		} else if(request.args.length >= 2 && !isNaN(request.args[1])) {
			p = post.get(request.args[1]) 
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
	
	function edit(request, response, session) {
		return secure(session, function() {
			var p = post.get(request.args[0])
			p.key = request.args[0]
			p.tags = p.tags.join(" ")
			
			return ["ok", render("view/blog/form.jhtml", p)]
		})
	}
	
	function save(request, response, session) {
		return secure(session, function() {
			var twit = request.params["key"] == null
			var p = post.persist(request.params["key"], request.params["title"], request.params["tags"])
					
			if(twit && p.tags.indexOf("tweet") != -1) {
				queue.add(TaskOptions.Builder.url("/_tasks/tweet").param("model", p.toSource()))
			}
			
			return ["redirect", "/" + request.params["key"]]
		})
	}
	
	function remove(request, response, session) {
		return secure(session, function() {
			post.remove(request.args[0])
			return ["redirect", "/"] 
		})
	}
	
	return {
		show: show,
		detail: detail,
		original: image.curry("original"),
		preview: image.curry("preview"),
		edit: edit,
		remove: remove,
		save: save
	}
})
