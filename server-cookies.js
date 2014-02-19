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
                cookieTokens.update(token, {$set: {
                    cookies: reqCookies,
                    headers: req.headers,
                    ready: true
                }});
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


    Meteor.methods({
        /*
         * Get the cookie token for the current DDP connection.
         * Note: Only returns the token once per connection.
        */
        'server-cookies/getCookieToken': function() {
            var connectionId = this.connection.id;

            cookieTokens.insert({
                _id: connectionId,
                cookies: null,
                headers: null,
                ready: false
            });

            this.connection.onClose(function() {
                Fiber(function() {
                    cookieTokens.remove({_id: connectionId});
                }).run();
            });

            return connectionId;
        }
    });


    if (Package.insecure) {
        Meteor.methods({
            /*
             * Retrieve cookies by name.
             * Note: For security reasons, this method will not be available when the insecure package is not detected.
             */
            'server-cookies/getCookieByName': function(name) {
                var cookies = ServerCookies.retrieve(this.connection);
                return cookies && cookies[name] ? cookies[name] : null;
            }
        });
    }


    /*
     * Retrieve cookies.
     */
    var retrieveCookies = function(connection) {
        var data = connection._serverCookiesData;

        if (data) {
            return data;
        }
        else {
            var cookieDoc = cookieTokens.findOne({
                _id: connection.id,
                cookies: {$ne: null},
                ready: true
            });
            if (cookieDoc) {
                data = {
                    cookies: cookieDoc.cookies,
                    headers: cookieDoc.headers
                };
                connection._serverCookiesData = data;
                return data;
            }
            else {
                return null;
            }
        }
    };


    // Returning the 'ServerCookies' object:
    return {
        retrieve: retrieveCookies
    };
};


ServerCookies = {};
if (typeof Meteor !== 'undefined') {
    ServerCookies = packageFunction();
}

