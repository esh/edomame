#Introduction
I am currently using latte to power <http://www.edomame.com>, my personal website. To post a picture, I email the picture to my website. I can also do this programatically using it's REST interface.

Pushing out new code is competely automated. I push my changes to github where it invokes the site's redeploy script using github service hooks. The script will run a suite of unit tests and if the tests pass, will push the new code to the live site. 

#Dependencies
* \*nix OS
* imagemagick
* JDK 1.5+

#Installing latte
1. clone the respository from github!
1. in a shell, move into the root directory
1. shell>./latte.sh scripts/db.create.js
1. shell>mkdir public/blog
1. modify app/config.js to your liking
1. shell>./latte.sh app init.js
1. open http://localhost:8080 from a browser!
1. login to admin by going to http://localhost:8080/admin
1. create a post by going to http://localhost:8080/blog/create
