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

function loadUI(target, keys, focus, admin) {
	const MAX_WIDTH = 370
	const MIN_WIDTH = 278
	var loadAmount = calcLoadAmount() 
	var end = keys.indexOf(anchor)
	var start = Math.max(0, end - loadAmount)
	var t = keys.slice(start, end + 1).reverse()

	target.html(genLoadNewer() + jQuery.map(t, genHTML).join(""))
	jQuery.map(t, getDetails)
	if(end < keys.length - 1) $("#loadNewer").click(loadNewer)

	$(window).scroll(function() {
		if(($(document).width() - $(window).width()) - $(window).scrollLeft() < 150 && start > 0) loadOlder()
	})

	$(window).resize(function() {
		if($(window).width() >= $(document).width()) {
			loadAmount = calcLoadAmount()
			loadOlder()
		}	
	})

	function calcLoadAmount() {
        	return parseInt($(window).width() / MIN_WIDTH * 1.2)
	}

	function loadOlder() {
		var t = Math.max(0, start - 1)
		start = Math.max(0, start - loadAmount) 
		t = keys.slice(start, t + 1).reverse()

		target.html(target.html() + jQuery.map(t, genHTML).join(""))
		jQuery.map(t, getDetails)
		if(end < keys.length - 1) $("#loadNewer").click(loadNewer)
	}

	function loadNewer() {
		$("#loadNewer").remove()
		
		var t = Math.min(keys.length - 1, end + 1)
		end = Math.min(keys.length - 1, end + Math.min(1,Math.floor($(window).width() / MAX_WIDTH)))
		t = keys.slice(t, end + 1).reverse()
	
		target.html(genLoadNewer() + jQuery.map(t, genHTML).join("") + target.html())
		jQuery.map(t, getDetails)
		if(end < keys.length - 1) $("#loadNewer").click(loadNewer)
	}

	function genLoadNewer() {
		if(end < keys.length - 1) return "<td id=\"loadNewer\"><div>&lt;<h1>Click for newer posts<h1></div></td>"
		else return ""
	}

	function genHTML(key, i) {
		var html = new Array()
        	html.push("<td id=\"")
                html.push(key)
                html.push("\">")
               	html.push(key == focus ? "<div class=\"focus\">" : "<div class=\"post\">")
               	html.push("<a href=\"/blog/")
                html.push(key)
                html.push("/o.jpg\"><img src=\"/blog/")
                html.push(key)
                html.push("/p.jpg\"/></a></div></td>")
		return html
	}

	function getDetails(key, i) {
		$.getJSON("/blog/detail/" + key, function(data) {
			var html = new Array()
			html.push($("#" + data.key + " div").html())
			html.push("<h1>")
			html.push(data.title)
			html.push("</h1><h2>")
			html.push(data.date)
			html.push("</h2>Tagged as&nbsp;")
			$.each(data.tags, function(i, tag) {
				html.push("<a href=\"/")
				html.push(tag)
				html.push("\">")
				html.push(tag)
				html.push("</a>&nbsp;")
			})

			if(admin) {
				html.push("<br/><br/><a href=\"/blog/edit/")
				html.push(data.key)
				html.push("\">edit</a>&nbsp;<a href=\"/blog/remove/")
				html.push(data.key)
				html.push("\">remove</a>")
			}
				
			$("#" + data.key + " div").html(html.join(""))
		})	
	}
}
