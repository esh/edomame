var config = require("config.js")
var admin = require("handler/admin.js")()
var ah = require("handler/ah.js")()
var tasks = require("handler/tasks.js")()
var blog = require("handler/blog.js")()
var rss = require("handler/rss.js")()

httpserver(config, require("utils/dispatcher.js")([
	{ route: /^\/rss$/, handler: rss.show },
	{ route: /^\/_admin\/login$/, handler: admin.login },
	{ route: /^\/_admin\/logout$/, handler: admin.logout },	
	{ route: /^\/_admin\/clearCache$/, handler: admin.clearCache },	
	{ route: /^\/_admin\/buildIndex$/, handler: admin.buildIndex },	
	{ route: /^\/_ah\/mail$/, handler: admin.mail },	
	{ route: /^\/_tasks\/buildIndex$/, handler: tasks.buildIndex },
	{ route: /^\/_tasks\/tweet$/, handler: tasks.tweet },
	{ route: /^\/([0-9]+)$/, handler: blog.show },
	{ route: /^\/([a-zA-Z]+)$/, handler: blog.show },
	{ route: /^\/([a-zA-Z]+)\/([0-9]+)$/, handler: blog.show },
	{ route: /^\/blog\/detail\/([0-9]+)$/, handler: blog.detail },
	{ route: /^\/blog\/image\/original\/([0-9]+)$/, handler: blog.original },
	{ route: /^\/blog\/image\/preview\/([0-9]+)$/, handler: blog.preview },
	{ route: /^\/$/, handler: blog.show }]))
