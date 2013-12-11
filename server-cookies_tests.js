
if (Meteor.isServer) {
    Meteor.methods({
        'test/getCookieByName': function(name) {
            var cookies = ServerCookies.retrieve(this);
            return cookies && cookies[name] ? cookies[name] : null;
        }
    });
}


testAsyncMulti('server-cookies - cookies should be available on server', (function() {
    if (Meteor.isClient) {
        
    }

    return [
        function(test, expect) {
            // TODO!
        }
    ];
})());

