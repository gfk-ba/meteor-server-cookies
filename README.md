meteor-server-cookies [![Build Status](https://travis-ci.org/gfk-ba/meteor-server-cookies.svg?branch=master)](https://travis-ci.org/gfk-ba/meteor-server-cookies)
=====================

Server-side access to http request cookies for Meteor.

An example use-case is sharing session cookies between Meteor and another application server running on the same domain.

* Version 0.4.0 of meteor-server-cookies will __ONLY__ work with Meteor version 0.7.0 or newer.
* Version 0.3.0 of meteor-server-cookies does __NOT__ work with Meteor version 0.7.0.


Usage
-----

After installing the package, on the `ServerCookies` object is available on the client side. It provides the (reactive) `ready` function, that returns whether the cookies are ready to be used by the Meteor methods on the server. After loading the Meteor page on the client it takes two roundtrips to the server before the cookie data is ready to be used.

On the server side there also is a (different) `ServerCookies` object available. It provides the `retrieve` method, that can be called from a Meteor method or publish function and should be provided the method client's connection as a parameter. It returns all the cookies and http request headers from the connected client. The cookie data is cached in the `_serverCookiesData` property of the connection object, used by subsequent calls to `retrieve`.

Usage example: (Please note that this example is for demonstration purposes only and should not be used in production! It introduces a security vulnerability by making all cookies, including the http-only cookies, available to the client!)

```javascript
if (Meteor.isServer) {
    Meteor.methods({
        'getCookieByName': function(name) {
            var data = ServerCookies.retrieve(this.connection);
            var cookies = data && data.cookies;
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

Notice that you should replace `'my_cookie_name'` with the name of a cookie that is set on the domain in which the application is running.

If there are no cookies set on the domain, then you can set one programmatically in the browser console as shown below. Then refresh the page in your browser.

```javascript
// Type this in your browser console to set a cookie, then refresh the page:
document.cookie = 'my_cookie_name=MyCookieValue';
```

**Note: Because json field name's can not contain a . or $ these characters are excaped to the unicode fullwidth versions: [．](http://www.fileformat.info/info/unicode/char/ff0e/index.htm) & [＄](http://www.fileformat.info/info/unicode/char/ff04/index.htm)**


How it works
------------

1. Upon page load, the server-cookies package will call a server method, which returns a unique token identifying the client and creates a document in the 'cookieToken' collection, that will be used to store the cookies for the connected client.
2. Using an injected script tag, a web request is made to the '/cookieToken' end-point registered by this package, along with the token as a parameter. The request will carry the client's cookies in its headers, which will be stored in the 'cookieToken' document identified by the token.
3. After the cookie-token web request is finished, the function `ServerCookies.ready()` will return `true` on the client. On the server `ServerCookies.retrieve(this.connection)` will return the connected client's cookies, when called from within a Meteor method.


Credits
-------

My thanks go out to the developer(s) of the [Meteor-headers](https://github.com/gadicohen/meteor-headers) package, from which I re-used a number of Meteor tricks to make this package work.
