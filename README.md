meteor-server-cookies
=====================

Server-side access to http request cookies for Meteor.

An example use-case is sharing session cookies between Meteor and another application server running on the same domain.


Usage
-----

After installing the package, on the `ServerCookies` object is available on the client side. It provides the (reactive) `ready` function, that returns whether the cookies are ready to be used by the Meteor methods on the server. After loading the Meteor page on the client it takes two roundtrips to the server before the cookie data is ready to be used.

On the server side there also is a (different) `ServerCookies` object available. It provides the `retrieve` method, that can be called from a Meteor method and should be provided the method's context as a parameter. It returns all the cookies from the connected client. The cookie data is cached in the `_sessionData` property of the method context, used by subsequent calls to `retrieve`.

Usage example: (Please note that this example is for demonstration purposes only and should not be used in production! It introduces a security vulnerability by making all cookies, including the http-only cookies, available to the client!)

```
if (Meteor.isServer) {
    Metheor.methods({
        'getCookieByName': function(name) {
            var cookies = ServerCookies.retrieve(this);
            return cookies && cookies[name] ? cookies[name] : null;
        }
    });
}

if (Meteor.isClient) {
    Deps.autorun(function() {
        if (ServerCookies.ready()) {
            Meteor.call('getCookieByName', 'my_cookie_name', function(err, result) {
                console.log('Cookie value:', result);
            });
        }
    });
}
```


How it works
------------

1. Upon page load, the server-cookies package will call a server method, which returns a unique token identifying the client and creates a document in the 'cookieToken' collection, that will be used to store the cookies for the connected client.
2. On the client side the token is used for two things:
  a. A subscription is created with the sole purpose of detecting client disconnects on the server side, so that the corresponding 'cookieToken' document will be cleaned up. The reactive computation for this subscription is stopped immediately after it is created.
  b. Using an injected script tag, a web request is made to the '/cookieToken' end-point registered by this package, along with the token as a parameter. The request will carry the client's cookies in its headers, which will be stored in the 'cookieToken' document identified by the token.
3. After the cookie-token web request is finished, the function `ServerCookies.ready()` will return `true` on the client. On the server `ServerCookies.retrieve(this)` will return the connected client's cookies, when called from within a Meteor method.


Credits
-------

My thanks go out to the developer(s) of the [Meteor-headers](https://github.com/gadicohen/meteor-headers) package, from which I re-used a number of Meteor tricks to make this package work.

