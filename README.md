# PollPrinceton

## About

A social polling app written by Ryan O'Shea, Tess Marchant, and Henry Lu for a semester project in COS 333 at Princeton.

## Technology Colophon, Credits, Details

You can read about who we are, the stack we deployed, and who we have to thank in `/frontend/humans.txt`.

## How To Deploy

- Get an Apache server running (I used XAMPP) to actually serve the app.
- Create a symlink between the Apache `htdocs` folder and the `/frontend` directory in this repository. For example, if your symlink is at `htdocs/pp`, browsing to `http://localhost/pp` will serve up the app. You may have to configure Apache to follow symlinks.  
- Edit Apache's `httpd.conf` by adding `ProxyPass /ppapi/ http://localhost:3000/` to the end and making sure the `mod_proxy` and `mod_proxy_http` modules are turned on. This redirects API requests to `http://localhost/ppapi` to port 3000, where our node.js backend runs. 
- Install node.js, cd into the `/backend/node` directory.
- Install the necessary node packages via `npm install express mongoose body-parser multer`
	- If you're on Ubuntu, you might need to follow the instructions [here](http://stackoverflow.com/a/22242472/859085) to get mongoose working.
- Install MongoDB and run it on the default port.
- Run `node server.js` to get the backend up and running.

## How to run on server
- cd into backend/node
- git pull
- pkill nodejs
- nodejs server.js > server.log &