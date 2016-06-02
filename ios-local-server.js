/* jshint node: true, mocha: true */

// run this script using `mocha ios-local-server.js`

'use strict';

require('./helpers/setup');

var wd = require('wd');
var _ = require('underscore');
var serverConfigs = require('./helpers/appium-servers');
var localServer = require('./helpers/local-server');

var formatNames = [
  'Store 1 Ad', 'Store 2 Ads', 'Store 3 Ads', 'Store 4 Ads',
  'Domino 1 Ad', 'Domino 2 Ads', 'Domino 3 Ads', 'Domino 4 Ads',
  'Postcard', 'Hyperscroller', 'Window', 'Pull',
  'Feature', 'Ticker', 'Wrapper'
];

function simpleTestSuite(formatIndex, formatName) {
  return function () {
    this.timeout(300000);
    var driver;
    var allPassed = true;

    before(function () {
      localServer.start();
      var serverConfig = serverConfigs.local;
      driver = wd.promiseChainRemote(serverConfig);
      require('./helpers/logging').configure(driver);

      var desired = _.clone(require('./helpers/caps').ios93);
      desired.app = '/Users/elbercarneiro/Desktop/Demo2.app';
      if (process.env.npm_package_config_sauce) {
        desired.name = 'ios - local server';
        desired.tags = ['sample'];
      }

      return driver.init(desired);
    });

    // CLOSE DRIVER AND CLEANUP
    after(function () {
      localServer.stop();
      return driver
        .quit()
        .finally(function () {
          if (process.env.npm_package_config_sauce) {
            return driver.sauceJobStatus(allPassed);
          }
        });
    });

    afterEach(function () {
      allPassed = allPassed && this.currentTest.state === 'passed';
    });

    // scroll to format and click on it, check for modal webview
    it('Store 1 Ad should open placement webview', function () {
      // formats 10, 11, and 12 do dot require button presses
      var button = (formatIndex > 9 && formatIndex < 13) ? '' : '/UIAButton[1]';

      return driver
        .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIATableView[1]/UIATableCell[' + formatIndex + ']')
        .click()
        .sleep(1000)
        .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIATableView[1]/UIATableCell[18]')
        .click()
        .sleep(2000)
        .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIATableView[1]/UIATableCell[15]' + button)
        .click()
        .sleep(3000)
        .contexts()
        .then(function (contexts) {
          var contextCount = contexts.length;
          return contextCount.should.equal(2);
        });
    });

    // switch to webview context and perform a basic command
    it('Store 1 Ad webview context should be available for testing', function () {
      return driver
        .context('WEBVIEW_1')
        .get('http://33.media.tumblr.com/762fa7a08f15cfe87dc05de591cb49eb/tumblr_inline_nyqvseewec1tqozky_500.gif')
        .sleep(2000)
        .currentContext()
        .then(function (context) {
          return context.should.equal('WEBVIEW_1');
        });
    });

    // switch to native context and check status
    it('Store 1 Ad native app context should be available for testing', function () {
      return driver
        .context('NATIVE_APP')
        .currentContext()
        .then(function (context) {
          return context.should.equal('NATIVE_APP');
        });
    });

    // close webview and check context count
    it('Store 1 Ad webview should close properly', function () {
      return driver
        .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIAToolbar[1]/UIAButton[1]')
        .click()
        .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIANavigationBar[1]/UIAButton[1]')
        .currentContext()
        .then(function (context) {
          return context.should.equal('NATIVE_APP');
        });
    });
  };
}

for (var i = 0; i < formatNames.length; i++) {

  // formatIndex matches UIATableCell index
  var formatIndex = i + 1;

  // run the test
  describe('Format ' + formatNames[i] + ' Smoke Test', simpleTestSuite(formatIndex, formatNames[i]));

  // skip running tests on Domino 1 Ad, Domino 3 Ads and Wrapper
  if ((i === 3) || (i === 5) || (i === 13)) { i++; }
}
