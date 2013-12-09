Package.describe({
    summary: "Server-side access to http request cookies."
});

Package.on_use(function(api) {
    api.use(['webapp'], ['server']);
    api.add_files('server-cookies.js', 'server');
    api.export('cookies', ['server']);
});

Package.on_test(function (api) {
  api.use('server-cookies');

  api.add_files('server-cookies_tests.js', ['server']);
});
