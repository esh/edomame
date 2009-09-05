require("runner.js")

with(run("tests")) {
	log.info(ok.toSource())
	log.info(failed.toSource())
}
