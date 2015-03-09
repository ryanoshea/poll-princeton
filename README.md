# PollPrinceton

## About

A social polling app written by Ryan O'Shea, Tess Marchant, and Henry Lu for a semester project in COS 333 at Princeton.

## Technology Colophon, Credits, Details

You can read about who we are, the stack we deployed, and who we have to thank in `/frontend/humans.txt`.

## How To Deploy Locally

- Get an Apache server running (I used XAMPP) to actually serve the app.
- Create a symlink between the Apache `htdocs` folder and the `/frontend` directory in this repository. For example, if your symlink is at `htdocs/pp`, browsing to `http://localhost/pp` will serve up the app. 
- Edit Apache's `httpd.conf` by adding `ProxyPass /ppapi/ http://localhost:3000/` to the end and making sure the lines `LoadModule proxy_module modules/mod_proxy.so` and `LoadModule proxy_http_module modules/mod_proxy_http.so` are present and not commented out. This redirects API requests to `http://localhost/ppapi` to port 3000, where our node.js backend runs. 
- Install node.js, cd into the `/backend/node` directory, and run `node server.js` to get the backend up and running. 
- *TODO: Add stuff about MongoDB setup here.*
