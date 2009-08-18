#!/bin/sh
rsync	--verbose --progress --stats --compress --rsh=/usr/bin/ssh \
	--recursive --times --perms --links --delete \
	--exclude "bin" --exclude "app/config.js" --exclude "src" --exclude "public/blog/*" --exclude "*.swp" \
	--exclude "scripts" --exclude "build.xml" --exclude "log" --exclude "db" --exclude "LICENSE" \
	--exclude "README.markdown" \
	* www@edomame.com:~/latte/
