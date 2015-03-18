ServerCookies = {
    _ready: new ReactiveVar(false),
    ready: function() {
        return ServerCookies._ready.get();
    }
};

/*
 * Store the cookies of this client for the specified token on the server.
 */
setCookieTokenCookies = function(token) {
    var scriptUrl = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX + '/cookieToken?token=' + encodeURIComponent(token);
    var script = $.getScript(scriptUrl, function() {
        ServerCookies._ready.set(true);
    });
};

trackConnectionStatus = function () {
    ServerCookies._ready.set(false);

    var status = Meteor.status(); // Reactively rerun this function when the connection status changes.

    if (!status.connected) {
        return;
    }

    // Retrieve the cookie token for this new connection:
    Meteor.apply(
            'server-cookies/getCookieToken',
            [],
            {
                onResultReceived: function(err, token) {
                    if (err || !token) {
                        return;
                    }

                    check(token, String);
                    setCookieTokenCookies(token);
                }
            }
    );
}

Meteor.startup(function() {
    Tracker.autorun(trackConnectionStatus);
});
