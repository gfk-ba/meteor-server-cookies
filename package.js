Package.describe({
    name: "gfk:server-cookies",
    summary: "Server-side access to http request cookies.",
    version: "0.2.0"
});

Package.onUse(function(api) {
    api.use(['webapp', 'underscore'], 'server');
    api.use([
        'tracker',
        'reactive-var',
        'jquery'
    ], 'client');

    api.addFiles([
        'server/server-cookies.js',
        'server/methods.js'
    ], 'server');

    api.addFiles(['client/server-cookies.js'], 'client');

    api.export('ServerCookies', ['server', 'client']);

    api.export([
        'cookieTokenRequestHandler',
        'cookieTokens',
        'cookieTokens',
        'serverCookieMethods'
        ], 'server', { testOnly: true });

    api.export([
        'trackConnectionStatus',
        'setCookieTokenCookies'
    ], 'client', { testOnly: true });


});

Package.onTest(function (api) {
  api.use(['gfk:server-cookies', 'tinytest', 'test-helpers', 'practicalmeteor:munit@2.1.2']);

  api.add_files([
      'test/server/server-cookies.test.js',
      'test/server/methods.test.js'
  ], ['server']);

  api.add_files('test/client/server-cookies.test.js', ['client']);
});
