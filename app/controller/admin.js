(function() {
	function show() {
		return login()
	}

	function deploy() {
		if(request.hostname.match(/(github.com)|(engineyard.com)/)) {
			log.info("redeploying...")
			try { log.info(shell("./scripts/deploy.local.sh")) } catch(e) {}
			return ["ok", ""]	
		} else {
			log.info("blocked deploy request from: " + request.hostname)
			return ["unauthorized"]
		}
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
