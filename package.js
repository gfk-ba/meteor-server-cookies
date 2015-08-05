Package.describe({
    name: "gfk:server-cookies",
    summary: "Server-side access to http request cookies.",
    version: "1.0.0"
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
        'serverCookieMethods'
        ], 'server', { testOnly: true });

    api.export([
        'trackConnectionStatus',
        'setCookieTokenCookies'
    ], 'client', { testOnly: true });


});

Package.onTest(function (api) {
  api.use([
    'gfk:server-cookies',
    'mike:mocha-package@0.5.8',
    'practicalmeteor:sinon',
    'practicalmeteor:chai'
  ]);

  api.add_files([
      'test/server/server-cookies.test.js',
      'test/server/methods.test.js'
  ], ['server']);

  api.add_files('test/client/server-cookies.test.js', ['client']);
});
