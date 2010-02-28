var config = require("config.js")
var ds = require("gae/datastore.js")()

httpserver(config, require("utils/dispatcher.js"))
