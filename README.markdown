#Introduction
I am currently using latte to power <http://www.edomame.com>, my personal website. Its a simple picture blog that I can update via email or it's REST interface. The code for edomame is bundled into this project.

#Dependencies
* \*nix OS
* imagemagick
* JDK 1.5+

#Installing latte
1. clone the respository from github!
1. in a shell, move into the root directory
1. shell>./latte run scripts/db.create.js
1. shell>mkdir public/blog
1. shell>./latte app init.js
1. open http://localhost:8080 from a browser!
