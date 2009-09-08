require("utils/common.js")

function run(dir) {
	var ok = new Array()
	var failed = new Array()

	open(dir).list().forEach(function(f) {
		if(open(dir + "/" + f).isDirectory()) {
			var res = run(dir + "/" + f)
			ok = ok.concat(res.ok)
			failed = failed.concat(res.failed)
		}
		else if(f.match(/^test_\w+.js$/) != null) {
			var path = dir.substring(dir.indexOf("/") + 1) + "/" + f
			var tests = require(path)

			for(var test in tests) {
				function assert(expr) {
					if(expr) ok.push(path + " - " + test)
					else failed.push(path + " - " + test)		
				}
				
				tests[test]()
			}
		}
	})

	return { ok: ok, failed: failed }
}
