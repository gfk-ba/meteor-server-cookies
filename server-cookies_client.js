
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
            // Retrieve the cookie token for this new connection:
            Meteor.call('server-cookies/getCookieToken', function(error, token) {
                if (!error) {
                    Meteor.subscribe('server-cookies_token', token);

                    if (token !== null) {
                        check(token, String);
                        setCookieTokenCookies(token);
                    }
                }
            });
        }
    });


    /*
     * Store the cookies of this client for the specified token on the server.
     */
    var setCookieTokenCookies = function(token) {
        var newScriptElem = document.createElement('script'),
        otherScriptElem = document.getElementsByTagName('script')[0];
        newScriptElem.src = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX + '/cookieToken?token=' + encodeURIComponent(token);
        otherScriptElem.parentNode.insertBefore(newScriptElem, otherScriptElem);

        Session.set(ServerCookies.readySessionKey, true);
    };
});


