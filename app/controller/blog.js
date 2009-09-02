(function() {
	var post = require("model/post.js")(db)
	var tagset = require("model/tagset.js")(db)
	var tags = require("model/tags.js")(db)

	function secure(fn) {
		if(session["authorized"]) return fn()
		else return ["unauthorized"]
	}
			
	function detail(key) {
		return ["ok", post.get(key).toSource()]
	}

	function comments(key) {
		return [
			"ok",
			hopen("http://www.listous.com/lists/user/esh2chan.xml?list=http://www.edomame.com/all/" + key).read(),
			"text/xml"]
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

	function edit(pkey) {
		return secure(function() {
			var p = post.get(pkey)
			p.tags = p.tags.join(" ")
			
			return ["ok", render("view/blog/form.jhtml", p)]
		})
	}
	
	function save() {
		return secure(function() {
			var twit = request.params["key"] == null
			var p = post.persist(
					request.params["key"],
					request.params["title"],
					request.params["upload"],
					request.params["tags"])
			
			require("utils/twitter.js")
			notify_twitter(p, twit)
			
			return ["redirect", "/blog/show/all/" + post.key]
		})
	}
	
	function remove(key) {
		return secure(function() {
			post.remove(key)
			return show()
		})
	}
	
	return {
		show: show,
		detail: detail,
		comments: comments,
		edit: edit,
		remove: remove,
		create: create,
		save: save
	}
})
