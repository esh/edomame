require("runner.js")

with(run("tests")) {
	log.info(failed == 0 ? "all tests passed" : "tests failed " + failed.toSource())
}
