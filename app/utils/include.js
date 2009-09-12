function include(path, prefix) {
	var id = path.substring(0, path.lastIndexOf(".")) +  "." + open((prefix != undefined ? prefix : "") + path).timestamp() + path.substring(path.lastIndexOf(".")) + ".generated"
	if(!open((prefix != undefined ? prefix : "") + id).exists()) shell("cp " + (prefix != undefined ? prefix : "") + path + " " + (prefix != undefined ? prefix : "") + id)
	return id 
}
