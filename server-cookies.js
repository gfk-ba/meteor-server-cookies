
var packageFunction = function() {
    WebApp.connectHandlers.use(function(req, res, next) {
        cookies.push(req.cookies);
        next();
    });

    Meteor.methods({
        'serverCookies': function() {
            return 'abcdef';
            return cookies;
        }
    });
};


if (typeof Meteor !== 'undefined') {
    cookies = [];
    packageFunction();
}

