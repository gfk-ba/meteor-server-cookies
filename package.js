Package.describe({
    summary: "Server-side access to http request cookies."
});

Package.on_use(function(api) {
    api.use(['webapp', 'livedata', 'underscore'], ['server']);

    // Allow us to detect 'insecure'.
    api.use('insecure', {weak: true});

    api.add_files('server-cookies.js', 'server');
    api.add_files('server-cookies_client.js', 'client');

    api.export && api.export('serverCookies', ['server']);
});

Package.on_test(function (api) {
  api.use('server-cookies');

  api.add_files('server-cookies_tests.js', ['server']);
});
