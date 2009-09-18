#!/bin/sh
cd latte 
git pull
ant
cp lib/latte.jar ../lib/
cp app/init.js ../app/
cp -R app/utils ../app/
