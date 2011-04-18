var lb

if(!Array.indexOf) {
	// IE, I hate you I hate you I hate you
	Array.prototype.indexOf = function(o) {
		for(var i=0 ; i < this.length ; i++) {
			if(this[i]==o)  return i;
		}
		return -1;
	}
}

function nav(s) {
	window.location = "/" + s.options[s.selectedIndex].value
}

function genHTML(post) {
	var html = new Array()
	html.push('<a href="/blog/image/preview/')
	html.push(post.key)
	html.push('" rel="lightbox[all]" class="thumb_link" title="')
	html.push(post.title)
	html.push(" (")
	html.push(post.tags.join(" "))
	html.push(')" id="')
	html.push(post.key)
	html.push('"><img class="thumb" rel="lightbox" src="/blog/image/thumb/')
	html.push(post.key)
	html.push('"/></a>')
	return html.join("")
}

function loadMore() {
	new Ajax.Request("/blog/more/" + type + "/" + posts[posts.length - 1].key, { method:'get',
		onSuccess: function(transport){
			var more = eval(transport.responseText).reverse()
			posts = posts.concat(more)
			$("thumbs").insert(more.map(genHTML).join(""))
			lb.updateImageList()
		}
	})
}

function loadUI(top, focus, posts, admin) {
	$("thumbs").update(posts.reverse().map(genHTML).join(""))
	lb = new Lightbox()
	if(focus) {
		lb.start(document.getElementById(new String(focus)))
	}
}



