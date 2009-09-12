#!/bin/sh
cd latte 
git pull
ant
cp lib/latte.jar ../lib/
