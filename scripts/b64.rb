#!/usr/bin/ruby

print [IO.read(File.join(Dir.pwd, ARGV[0]))].pack("m") 
