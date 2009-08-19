(function() {
	function show() {
		return login()
	}

	function deploy() {
		log.info("deploy request from: " + request.hostname)


		try { log.info(shell("./scripts/deploy.local.sh")) } catch(e) {}	
		return ["ok", ""]
	}
	
	function login() {
		if(request.params["passcode"] == config.sitepass) {
			session["authorized"] = true
			return ["redirect", "/"]
		} else return ["ok", render("view/admin/password.jhtml", new Object())]
	}
	
	function logout() {
		session["authorized"] = false
		return ["redirect", "/"]
	}
	
	return {
		show: show,
		deploy: deploy,
		login: login,
		logout: logout
	}
})
