function FakeResponse () {
    this.writeHead = sinon.stub();
    this.end = sinon.stub();
}

function getRandomId () {
    return ((Math.random() * 1e6) | 0).toString();
}

describe('ServerCookies', function () {
    describe('#cookieTokenRequestHandler', function () {
        var fakeRequest, fakeResponse;

        beforeEach(function () {
            fakeRequest = {
                query: {
                    token: getRandomId()
                },
                headers: {
                    cookie: 'foo=bar'
                }
            };

            cookieTokens.insert({
                _id: fakeRequest.query.token,
                cookies: null,
                headers: null,
                ready: false
            });

            fakeResponse = new FakeResponse();
        });

        it('Should save the cookies in the request', function (done) {
            cookieTokenRequestHandler(fakeRequest, fakeResponse);

            var timedTest = function () {
                try {
                    var cookieToken = cookieTokens.findOne(fakeRequest.query.token) || {};
                    expect(cookieToken.cookies).to.eql({foo:'bar'});
                    done();
                } catch (error) {
                    done(error);
                }
            };

            Meteor.setTimeout(timedTest, 10);
        });

        it('Should return a 200 http response code', function (done) {
            cookieTokenRequestHandler(fakeRequest, fakeResponse);

            var timedTest = function () {
                try {
                    expect(fakeResponse.writeHead).to.be.calledWith(200);
                    done();
                } catch (error) {
                    done(error);
                }
            };

            Meteor.setTimeout(timedTest, 10);
        });

        describe('#retrieve', function () {
            describe('When connection contains _serverCookiesData', function () {
                it ('Should return _serverCookiesData', function () {
                    var fakeConnection = {
                        _serverCookiesData: {
                            foo: 'bar'
                        }
                    };

                    expect(ServerCookies.retrieve(fakeConnection)).to.eql(fakeConnection._serverCookiesData);
                });
            });
            describe('When cookieToken matching the connectionId was not created yet', function () {
                it ('Should return null', function () {
                    var fakeConnection = {
                        id: getRandomId()
                    };

                    expect(ServerCookies.retrieve(fakeConnection)).to.eql(null);
                });
            });

            describe('When cookieToken matching the connectionId was not ready yet', function () {
                it ('Should return null', function (done) {
                    var fakeConnection = {
                        id: getRandomId()
                    };

                    cookieTokens.insert({
                        _id: fakeConnection.id,
                        ready: false
                    });

                    var timedTest = function () {
                        try {
                            expect(ServerCookies.retrieve(fakeConnection)).to.eql(null);
                            done();
                        } catch (error) {
                            done(error);
                        }
                    };

                    Meteor.setTimeout(timedTest, 10);
                });
            });

            it('Should return the cookies and headers', function (done) {
                var fakeConnection = {
                    id: getRandomId(),
                };

                var fakeCookieToken = {
                    _id: fakeConnection.id,
                    ready: true,
                    cookies: {
                        foo: 'bar',
                        bar2: 'foo3'
                    },
                    headers: {
                        someHeader: 'something'
                    }
                };

                cookieTokens.insert(fakeCookieToken);

                var timedTest = function () {
                    try {
                        expect(ServerCookies.retrieve(fakeConnection)).to.eql({
                            cookies: fakeCookieToken.cookies,
                            headers: fakeCookieToken.headers
                        });
                        expect(fakeConnection._serverCookiesData).to.eql({
                            cookies: fakeCookieToken.cookies,
                            headers: fakeCookieToken.headers
                        });
                        done();
                    } catch (error) {
                        done(error);
                    }
                };

                Meteor.setTimeout(timedTest, 10);
            });
        });
    })
});
