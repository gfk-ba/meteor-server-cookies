Package.describe({
    summary: "Server-side access to http request cookies for Meteor."
});

Package.on_use(function(api) {
    api.use(['webapp'], ['server']);
    api.export('cookies', ['server']);
});
