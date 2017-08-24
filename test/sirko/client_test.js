import assert from 'assert';
import sinon from 'sinon';
import helpers from '../helpers';

import Client from '../../src/sirko/client';
import Storage from '../../src/sirko/storage';

describe('Client', function() {
  beforeEach(function() {
    this.reqInfo = {
      agent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:50.0) ' +
        'Gecko/20100101 Firefox/50.0',
      currentPath: '/',
      domain: 'app.io'
    };

    this.conf = {
      engineUrl: 'https://sirko.io'
    };

    this.server = sinon.fakeServer.create({autoRespond: true});

    this.respond = (path = '/list') => {
      this.server.respondWith(
        /sirko\.io/,
        [200, {}, JSON.stringify({path: path, assets: []})]
      );
    };
  });

  afterEach(function() {
    this.server.restore();
    Storage.clear();
  });

  describe('.predict', function() {
    it('resolves the given promise', function() {
      this.respond();

      return Client.predict(this.reqInfo, this.conf).then((res) => {
        let [predictedPath, wasPrevCorrect] = res;

        assert.equal(predictedPath, '/list');
        assert.equal(wasPrevCorrect, undefined);
      });
    });

    context('it is a mobile browser', function() {
      beforeEach(function() {
        this.reqInfo.agent = 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 4 Build/LMY48T)' +
          ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.91 Mobile Safari/537.36';
      });

      it('returns false right away', function() {
        let res = Client.predict(this.reqInfo, this.conf);

        assert.equal(res, false);
      });
    });

    context('the referrer belongs to an external site', function() {
      beforeEach(function() {
        this.reqInfo.referrer = 'http://www.google.com/some-path';
        this.respond();
      });

      it('does not send the referrer', function() {
        return Client.predict(this.reqInfo, this.conf).then(() => {
          let request = this.server.requests[0];

          assert.equal(
            JSON.parse(request.requestBody).referrer,
            undefined
          );
        });
      });
    });
  });
});
