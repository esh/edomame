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

function loadUI(keys, focus, admin) {
	var MAX_WIDTH = 370
	var MAX_HEIGHT = 370
	var MIN_WIDTH = 278

	$("#nav").css("padding-top", Math.floor(($(document).height() - MAX_HEIGHT) * 1 / 3 - 51))
	$("#body").css("padding-top", Math.floor(($(document).height() - MAX_HEIGHT) * 1 / 3))

	var loadAmount = calcLoadAmount() 
	var end = keys.indexOf(focus)
	var start = Math.max(0, end - loadAmount)
	var t = keys.slice(start, end + 1).reverse()

	$("#content").html(genLoadNewer() + jQuery.map(t, genHTML).join(""))
	$.each(t, getDetails)
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

		$("#content").append(jQuery.map(t, genHTML).join(""))
		$.each(t, getDetails)
		if(end < keys.length - 1) $("#loadNewer").click(loadNewer)
	}

	function loadNewer() {
		$("#loadNewer").remove()
		
		var t = Math.min(keys.length - 1, end + 1)
		end = Math.min(keys.length - 1, end + Math.min(1,Math.floor($(window).width() / MAX_WIDTH)))
		t = keys.slice(t, end + 1).reverse()
	
		$("#content").html(genLoadNewer() + jQuery.map(t, genHTML).join("") + $("#content").html())
		$.each(t, getDetails)
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
                html.push("\"><a href=\"/blog/image/original/")
                html.push(key)
                html.push("\"><img src=\"/blog/image/preview/")
                html.push(key)
                html.push("\"/></a></td>")
		return html
	}

	function getDetails(i, key) {
		$.getJSON("/blog/detail/" + key, function(data) {
			var html = new Array()
			html.push($("#" + key).html())
			html.push("<h2>")
			html.push(data.title)
			html.push("</h2>")
			html.push(data.date.toDateString())
			html.push("&nbsp;-&nbsp;")
			$.each(data.tags, function(i, tag) {
				html.push("<a href=\"/")
				html.push(tag)
				html.push("\">")
				html.push(tag)
				html.push("</a>&nbsp;")
			})
			html.push("<br/>")
			html.push('<iframe style="margin-top:2px;width:80px;height:21px" src="http://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fwww.edomame.com%2F')
			html.push(key + "")
			html.push('&amp;layout=button_count&amp;show_faces=false&amp;action=like&amp;colorscheme=light" scrolling="no" frameborder="0" allowTransparency="true" style="border:none; overflow:hidden; width:80px; height:px"></iframe>')
			if(admin) {
				html.push("<br/><br/><a href=\"/blog/edit/")
				html.push(key)
				html.push("\">edit</a>&nbsp;<a href=\"/blog/remove/")
				html.push(key)
				html.push("\">remove</a>")
			}
				
			$("#" + key).html(html.join(""))
		})	
	}
}
