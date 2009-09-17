#Introduction
I am currently using latte to power <http://www.edomame.com>, my personal website. Its a simple picture blog that I can update via email or it's REST interface. The site also has automatic redeployment from github using service hooks.

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
