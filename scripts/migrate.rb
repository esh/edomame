#!/usr/bin/ruby

require 'sqlite3'
require 'cgi'
require 'json'
require 'net/http'
require 'uri'

url = URI.parse('http://localhost:8080/api/create')

db = SQLite3::Database.new("db")
db.execute( "select * from posts" ) do |row|
	#sleep 18 
	fd = Dir.glob("blog/" + row[0] + "/o.*")[0]
	req = Net::HTTP::Post.new(url.path, initheader = {'Content-Type' => 'application/json'})
	req.basic_auth 'username', 'password'
	req.body = "(" + {
		"title" => CGI.unescape(row[1]),
		"timestamp" => Time.parse(row[2]).to_i * 1000,
		"photo" => [IO.read(fd)].pack("m"),
		"ext" => fd.split(".")[1],
		"tags" => db.execute("select name from tags where post=?", row[0].to_i).map{|tag| tag[0]}.join(" ") 
	}.to_json + ")"
	res = Net::HTTP.new(url.host, url.port).start {|http| http.request(req) }
	case res
	when Net::HTTPSuccess, Net::HTTPRedirection
	else
		res.error!
	end
end
