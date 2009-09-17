(function() {
	function show() {
		return login()
	}

	function secure(fn) {
		if(session["authorized"]) return fn()
		else return ["unauthorized"]
	}

	function login() {
		if(request.params["passcode"] == config.sitepass) {
			session["authorized"] = true
			session["attempt"] = null
			return ["redirect", "/"]
		} else if(session["attempt"] == null || session["last"] < (new Date()).getTime()) {
			session["attempt"] = session["attempt"] == null ? 1 : session["attempt"] + 1
			session["last"] = (new Date()).getTime() + 8000 * session["attempt"]
			return ["ok", render("view/admin/password.jhtml", new Object())]
		} else {
			return ["unauthorized"]
		}
	}
	
	function logout() {
		session["authorized"] = false
		return ["redirect", "/"]
	}
	
	function logs() {
		return secure(function() {
			return ["ok", open("log/server.log").read()]
		})
	}

	return {
		show: show,
		login: login,
		logout: logout,
		logs: logs
	}
})
