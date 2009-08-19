#!/bin/sh
cd ../../staging/edomame
git pull
rsync	--verbose --progress --stats --compress \
	--recursive --times --perms --links --delete \
	--exclude "app/config.js" --exclude "public/blog/*" \
	--exclude "scripts" --exclude "db" --exclude "LICENSE" \
	--exclude "README.markdown" \
	* ../../live/edomame
