// npm dependencies
var Fiber = Npm.require('fibers');


var packageFunction = function() {
    /*
     * Parse request cookie string.
     * Function content copied from stackoverflow answer by Corey Hart.
     * See: http://stackoverflow.com/questions/3393854/get-and-set-a-single-cookie-with-node-js-http-server
    */
    var parseCookies = function(request) {
        var list = {},
            rc = request.headers.cookie;

        rc && rc.split(';').forEach(function( cookie ) {
            var parts = cookie.split('=');
            list[parts.shift().trim()] = unescape(parts.join('='));
        });

        return list;
    };


    // Meteor collection to store cookie information:
    var cookieTokens = new Meteor.Collection('cookieToken');


    // Request handler for cookie-token requests:
    WebApp.connectHandlers.use('/cookieToken', function(req, res, next) {
        Fiber(function() {
            var token = req.query.token,
                reqCookies = parseCookies(req);
                cookieTokenDoc = cookieTokens.findOne({_id: token});

            if (cookieTokenDoc && cookieTokenDoc.cookies === null) {
                cookieTokens.update(token, {$set: {cookies: reqCookies, headers: req.headers}});
            }
        }).run();

        res.writeHead(200, { 'Content-type': 'application/javascript' });
        res.end("//nop", 'utf8');
    });


    /*
     * Generate a unique token.
    */
    var generateUniqueToken = function() {
        // TODO: Don't use this function with this implementation in production! Re-implement this properly!
        return 'RandomToken_' + Math.random();
    };


    Meteor.publish('server_cookies_token', function(token) {
        console.log('SESSION OPENED', token, this._session.socket.id);

        this._session.socket.on('close', function() {
            Fiber(function() {
                cookieTokens.remove({_id: token});
            }).run();
        });

        this.stop();
    });


    Meteor.methods({
        /*
         * Get the cookie token for the current DDP connection.
         * Note: Only returns the token once per connection.
        */
        'getCookieToken': function() {
            if (!this._sessionData.cookieToken) {
                var token = generateUniqueToken();
                this._sessionData.cookieToken = token;
                cookieTokens.insert({
                    _id: token,
                    cookies: null,
                    headers: null
                });
                return token;
            }
            else {
                return null;
            }
        }
    });


    if (Package.insecure) {
        Meteor.methods({
            /*
             * Retrieve cookies by name.
             * Note: For security reasons, this method will not be available when the insecure package is not detected.
             */
            'getCookieByName': function(name) {
                var cookies = ServerCookies.retrieve(this);
                return cookies && cookies[name] ? cookies[name] : null;
            }
        });
    }


    /*
     * Retrieve cookies.
     */
    var retrieveCookies = function(methodContext) {
        check(methodContext._sessionData, Object);

        if (methodContext._sessionData.cookies) {
            return methodContext._sessionData.cookies;
        }
        else if (methodContext._sessionData.cookieToken) {
            var cookieDoc = cookieTokens.findOne({_id: methodContext._sessionData.cookieToken});
            if (cookieDoc && cookieDoc.cookies) {
                methodContext._sessionData.cookies = cookieDoc.cookies;
                return cookieDoc.cookies;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    };


    // Returning the 'ServerCookies' object:
    return {
        retrieve: retrieveCookies
    };
};


if (typeof Meteor !== 'undefined') {
    ServerCookies = packageFunction();
}

