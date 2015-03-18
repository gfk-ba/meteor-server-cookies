var Fiber = Npm.require('fibers');

serverCookieMethods = {
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
}

Meteor.methods(serverCookieMethods);
