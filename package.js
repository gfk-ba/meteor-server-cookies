Package.describe({
    summary: "Server-side access to http request cookies."
});

Package.on_use(function(api) {
    api.use(['webapp'], ['server']);
    api.add_files('server-cookies.js', 'server');
    api.export('cookies', ['server']);
});
