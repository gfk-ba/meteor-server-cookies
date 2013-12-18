
ServerCookies = {
    readySessionKey: 'server-cookies/ready',
    ready: function() {
        return Session.get(ServerCookies.readySessionKey);
    }
};


Meteor.startup(function() {
    Session.setDefault(ServerCookies.readySessionKey, false);

    Deps.autorun(function() {
        Session.set(ServerCookies.readySessionKey, false);
        var status = Meteor.status(); // Reactively rerun this function when the connection status changes.
        if (status.connected) {
            // TODO: Make the timeout configurable, to simulate slow server.
            Meteor.setTimeout(function() {
                // Retrieve the cookie token for this new connection:
                Meteor.call('server-cookies/getCookieToken', function(error, token) {
                    if (!error) {
                        if (token !== null) {
                            check(token, String);
                            setCookieTokenCookies(token);
                        }
                    }
                });
            }, 0);
        }
    });


    /*
     * Store the cookies of this client for the specified token on the server.
     */
    var setCookieTokenCookies = function(token) {
        var scriptUrl = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX + '/cookieToken?token=' + encodeURIComponent(token);
        var script = $.getScript(scriptUrl, function() {
            Session.set(ServerCookies.readySessionKey, true);
        });
    };
});

