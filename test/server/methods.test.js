function getRandomId () {
    return ((Math.random() * 1e6) | 0).toString();
}

describe('serverCookieMethods', function () {
    describe('server-cookies/getCookieToken', function () {
        var fakeContext;

        beforeEach(function () {
            fakeContext = {
                connection: {
                    id: getRandomId(),
                    onClose: sinon.stub()
                }
            };
        });

        it('Should insert the connection id into the cookieTokens collection', function () {
            serverCookieMethods['server-cookies/getCookieToken'].call(fakeContext);

            expect(cookieTokens.findOne(fakeContext.connection.id)).to.be.a('object');
        });

        it('Should remove the cookieToken on connection close', function () {
            serverCookieMethods['server-cookies/getCookieToken'].call(fakeContext);

            fakeContext.connection.onClose.args[0][0]();
            expect(cookieTokens.findOne(fakeContext.connection.id)).to.equal(undefined);
        });
    });
});
