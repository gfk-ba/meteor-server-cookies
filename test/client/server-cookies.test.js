describe('ServerCookies', function () {
    var sandbox;

    beforeEach(function () {
        if (sandbox) {
            sandbox.restore(); //Munit doesn't execute afterEach if test fails
        }

        sandbox = sinon.sandbox.create();
    });

    describe('#trackConnectionStatus', function () {
        beforeEach(function () {
            sandbox.stub(Meteor, 'status');
            sandbox.stub(Meteor, 'apply');
        })

        describe('When connection is not ready', function () {
            it('Should do nothing', function () {
                Meteor.status.returns({
                    connected: false
                });

                trackConnectionStatus();

                expect(Meteor.apply).to.have.not.been.called;
            });
        });

        it('Should call getCookieToken meteor method', function () {
            Meteor.status.returns({
                connected: true
            });

            trackConnectionStatus();

            expect(Meteor.apply).to.have.been.calledWith('server-cookies/getCookieToken');
        });
    });

    describe('#setCookieTokenCookies', function () {
        it('Should call the cookieToken endPoint', function () {
            var testToken = '123456';

            sandbox.stub($, 'getScript');
            setCookieTokenCookies(testToken);

            expect($.getScript).to.have.been.calledOnce;
            expect($.getScript.args[0][0].split('?')[1]).to.equal('token=' + testToken);
        });
        it('Should set _ready to true', function () {
            var testToken = '123456';

            sandbox.stub($, 'getScript').yields();
            setCookieTokenCookies(testToken);

            expect(ServerCookies.ready()).to.equal(true);
        });
    });
});
