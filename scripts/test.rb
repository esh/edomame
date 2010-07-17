#!/usr/bin/ruby

require 'net/http'
require 'uri'

title = "dodesuka" 
tags = "a b"
photo = [IO.read(ARGV[0])].pack("m") 
ext = ARGV[0].split(".")[1] 

#url = URI.parse('http://edomamejs.appspot.com/api/create')
url = URI.parse('http://localhost:8080/api/create')

req = Net::HTTP::Post.new(url.path, initheader = {'Content-Type' => 'application/json'})
req.basic_auth 'esh', 'eddio22'
req.body  = "({\"title\":\"#{title}\",\"photo\":\"#{photo}\",\"ext\":\"#{ext}\",\"tags\":\"#{tags}\"})"

res = Net::HTTP.new(url.host, url.port).start {|http| http.request(req) }
case res
when Net::HTTPSuccess, Net::HTTPRedirection
	# OK
else
	res.error!
end
