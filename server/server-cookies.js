// npm dependencies
var Fiber = Npm.require('fibers');

// Meteor collection to store cookie information:
cookieTokens = new Meteor.Collection('cookieToken');


/**
 * Escapes the mongo `key`.
 *
 * @param {String} key
 * @return {String}
 */

function mongoEscape (key) {
  return key.replace(/\$/g, '\uFF04')
            .replace(/\./g, '\uFF0E');
}

/*
 * Parse request cookie string.
 * Function content copied from stackoverflow answer by Corey Hart.
 * See: http://stackoverflow.com/questions/3393854/get-and-set-a-single-cookie-with-node-js-http-server
*/
function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[mongoEscape(parts.shift().trim())] = unescape(parts.join('='));
    });

    return list;
}

cookieTokenRequestHandler = function (req, res) {
    Fiber(function() {
        var token = req.query.token,
            reqCookies = parseCookies(req),
            cookieTokenDoc = cookieTokens.findOne({_id: token});

        if (cookieTokenDoc && cookieTokenDoc.cookies === null) {
            cookieTokens.update({_id: token}, {
                cookies: reqCookies,
                headers: req.headers,
                ready: true
            });
        }

        Meteor.defer(function() {
            res.writeHead(200, { 'Content-type': 'application/javascript' });
            res.end("//nop", 'utf8');
        });
    }).run();
};

// Request handler for cookie-token requests:
WebApp.connectHandlers.use('/cookieToken', cookieTokenRequestHandler);


ServerCookies = {
    /*
     * Retrieve cookies.
     */
    retrieve: function(connection) {
        var data = connection._serverCookiesData;

        if (data) {
            return data;
        }

        var cookieDoc = cookieTokens.findOne({
            _id: connection.id,
            cookies: {$ne: null},
            ready: true
        });

        if (!cookieDoc) {
            return null;
        }

        data = {
            cookies: cookieDoc.cookies,
            headers: cookieDoc.headers
        };

        connection._serverCookiesData = data;

        return data;
    }
};
