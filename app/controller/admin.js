(function() {
	function show() {
		return login()
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
	
	return {
		show: show,
		login: login,
		logout: logout
	}
})
