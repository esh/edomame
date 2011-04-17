(function() {
	importPackage(com.google.appengine.api.labs.taskqueue, com.google.appengine.api.blobstore)

	var queue = QueueFactory.getQueue("tasks")
	var fs = FileServiceFactory.getFileService()
	var post = require("model/post.js")()
	var tagset = require("model/tagset.js")()
	var tags = require("model/tags.js")()

	require("utils/common.js")

	function secure(session, fn) {
		if(session["authorized"]) return fn()
		else return ["unauthorized"]
	}
			
	function image(type, request, response, session) {
		return ["blob", new BlobKey(post.get(request.args[0]).images[type])]
	}

	function getPosts(from, keys, inclusive) {
		var end = Math.max(from != null ? keys.indexOf(from) : keys.length - 1)
		var begin = Math.max(0, end - 48)
		return keys.slice(begin, end + (inclusive ? 1 : 0)).map(function(e) { return post.get(e) })
	}

	function more(request, response, session) {
		return ["ok", getPosts(parseInt(request.args[1]), tagset.get(request.args[0]), false).toSource(), "application/javascript"]
	}
 
	function show(request, response, session) {
		var type
		var focus

		if(request.args.length == 1 && isNaN(request.args[0])) {
			type = request.args[0]
		} else if(request.args.length == 1 && !isNaN(request.args[0])) {
			type = "all";
			focus = post.get(request.args[0])
		} else if(request.args.length == 2 && !isNaN(request.args[1])) {
			type = request.args[0]
			focus = post.get(request.args[1])
		} else {
			type = "all";
		}

		var keys = tagset.get(type)
		var posts = getPosts(focus != null ? parseInt(focus.key) : null, keys, true)
 
		return ["ok", render(
				"view/blog/show.jhtml",
				{
					top: keys.length > 0 ? keys.slice(-1)[0] : 0,
					focus: focus,
					posts: posts,
					type: type, 
					cloud: tags.get(),
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
		more: more,
		original: image.curry("original"),
		preview: image.curry("preview"),
		thumb: image.curry("thumb"),
		edit: edit,
		remove: remove,
		save: save
	}
})
