#!/bin/sh
cd ../../staging/edomame
git pull

if ./latte.sh app:tests deployment_runner.js | grep 'all tests passed'; then
rsync	--verbose --progress --stats --compress \
	--recursive --times --perms --links --delete \
	--exclude "app/config.js" --exclude "public/blog/*" \
	--exclude "db/*" --exclude "LICENSE" \
	--exclude "README.markdown" --exclude "log/*" \
	* ../../live/edomame
fi
