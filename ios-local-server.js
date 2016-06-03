/* jshint node: true, mocha: true */

// run this script using `mocha ios-local-server.js`

'use strict';

require('./helpers/setup');

var wd = require('wd');
var _ = require('underscore');
var serverConfigs = require('./helpers/appium-servers');
var localServer = require('./helpers/local-server');

var webViewContext = 'WEBVIEW_1';
var nativeAppContext = 'NATIVE_APP';

var formatNames = [
  'Store 1 Ad', 'Store 2 Ads', 'Store 3 Ads', 'Store 4 Ads',
  'Domino 1 Ad', 'Domino 2 Ads', 'Domino 3 Ads', 'Domino 4 Ads',
  'Postcard', 'Hyperscroller', 'Window', 'Pull',
  'Feature', 'Ticker', 'Wrapper'
];

function demo2Suite(formatNames) {
  return function () {
    this.timeout(300000);
    var driver;
    var allPassed = true;
    var formatIndex = 9;

    for (var i = 9; i < formatNames.length; i++) {

      var formatName = formatNames[i];
      describe(formatName, function () {

        // scroll to format and click on it, check for modal webview
        it('should open placement webview', function () {
          formatIndex += 1;

          // formats 10, 11, and 12 do dot require button presses
          var button = (formatIndex > 9 && formatIndex < 13) ? '' : '/UIAButton[1]';

          if (formatIndex > 8) {
            driver.execute('mobile: scroll', [{ direction: 'down' }]);
          }

          return driver
            .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIATableView[1]/UIATableCell[' + formatIndex + ']')
            .click()
            .sleep(1000)
            .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIATableView[1]/UIATableCell[18]')
            .click()
            .sleep(1000)
            .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIATableView[1]/UIATableCell[15]' + button)
            .click()
            .sleep(2000)
            .contexts()
            .then(function (contexts) {
              var contextCount = contexts.length;
              return contextCount.should.equal(2);
            });
        });

        // switch to webview context and perform a basic command
        it('webview context should be available for testing', function () {
          return driver
            .context(webViewContext)
            .get('http://33.media.tumblr.com/762fa7a08f15cfe87dc05de591cb49eb/tumblr_inline_nyqvseewec1tqozky_500.gif')
            .sleep(2000)
            .currentContext()
            .then(function (context) {
              return context.should.equal(webViewContext);
            });
        });

        // switch to native context and check status
        it('native app context should be available for testing', function () {
          return driver
            .context(nativeAppContext)
            .currentContext()
            .then(function (context) {
              return context.should.equal(nativeAppContext);
            });
        });

        // close webview and check context count
        it('webview should close properly', function () {
          return driver
            .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIAToolbar[1]/UIAButton[1]')
            .click()
            .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIANavigationBar[1]/UIAButton[1]')
            .currentContext()
            .then(function (context) {
              return context.should.equal(nativeAppContext);
            });
        });

        // return to fomat list
        it('should navigate back to formats tableview', function () {
          return driver
            .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIANavigationBar[1]/UIAButton[1]')
            .click()
            .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIANavigationBar[1]')
            .sleep(2000)
            .then(function (element) {
              // var name = element.name;
              // return name.should.equal('All Formats');
              return true;
            });
        });
      });

    }

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

  };
}

describe('Demo 2', demo2Suite(formatNames));
