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

            // TODO: Make timeout configurable, to simulate request latency.
            Meteor.setTimeout(function() {
                res.writeHead(200, { 'Content-type': 'application/javascript' });
                res.end("//nop", 'utf8');
            }, 0);
        }).run();
    });


    /*
     * Generate a unique token.
    */
    var generateUniqueToken = function() {
        // TODO: Don't use this function with this implementation in production! Re-implement this properly!
        return 'RT_' + ('' + Math.random()).slice(2) + '_' + (new Date()).getTime();
    };


    // Store the cookie token as session data, and...
    // Make sure the cookieToken collection data is removed upon disconnection:
    Meteor.publish('server-cookies_token', function(token) {
        if (!this._session.sessionData) {
            this._session.sessionData = {};
        }
        this._session.sessionData.cookieToken = token;
        cookieTokens.update(token, {$set: {ready: true}});

        this._session.socket.on('close', function() {
            Fiber(function() {
                cookieTokens.remove({_id: token});
            }).run();
        });

        this.ready(); // Triggers the onReady callback on the client.
        this.stop();
    });


    Meteor.methods({
        /*
         * Get the cookie token for the current DDP connection.
         * Note: Only returns the token once per connection.
        */
        'server-cookies/getCookieToken': function() {
            if (!this._sessionData.cookieToken) {
                var token = generateUniqueToken();
                this._sessionData.cookieToken = token;
                cookieTokens.insert({
                    _id: token,
                    cookies: null,
                    headers: null,
                    ready: false
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
            'server-cookies/getCookieByName': function(name) {
                var cookies = ServerCookies.retrieve(this);
                return cookies && cookies[name] ? cookies[name] : null;
            }
        });
    }


    /*
     * Retrieve cookies.
     */
    var retrieveCookies = function(context) {
        var sessionData = {};
        if (typeof context._sessionData === 'object') {
            sessionData = context._sessionData;
        }

        if (sessionData.cookies) {
            return sessionData.cookies;
        }
        else if (sessionData.cookieToken) {
            var cookieDoc = cookieTokens.findOne({
                _id: sessionData.cookieToken,
                cookies: {$ne: null},
                ready: true
            });
            if (cookieDoc && cookieDoc.cookies) {
                if (sessionData) {
                    sessionData.cookies = cookieDoc.cookies;
                    sessionData.headers = cookieDoc.headers;
                }
                return {
                    cookies: cookieDoc.cookies,
                    headers: cookieDoc.headers
                };
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    };


    /*
     * Observe cookies.
     */
    var observeCookies = function(context, callback) {
        var cookieToken = '';
        if (typeof context._session === 'object' && typeof context._session.sessionData === 'object') {
            cookieToken = context._session.sessionData.cookieToken;
        }
        if (!cookieToken) {
            throw new Meteor.Error(1001, 'CookieToken not available');
        }

        var cursor = cookieTokens.find({
            _id: cookieToken,
            cookies: {$ne: null},
            ready: true
        });
        if (cursor.count() === 0) {
            return null; // Cookies not ready!
        }
        
        cursor.observeChanges({
            removed: callback
        });
        
        var cookieDoc = cursor.fetch()[0];
        return {
            cookies: cookieDoc.cookies,
            headers: cookieDoc.headers
        };
    };


    // Returning the 'ServerCookies' object:
    return {
        retrieve: retrieveCookies,
        observe: observeCookies
    };
};


ServerCookies = {};
if (typeof Meteor !== 'undefined') {
    ServerCookies = packageFunction();
}

