/* jshint node: true, mocha: true */

// run this script using `mocha ios-local-server.js`

'use strict';

require('../config/setup');

var wd = require('wd');
var _ = require('underscore');
var serverConfigs = require('../config/appium-servers');
var localServer = require('../config/local-server');

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
    var formatIndex = 0;

    // element paths
    var navBarText = '//UIAApplication[1]/UIAWindow[1]/UIANavigationBar[1]/UIAStaticText[1]';
    var navBarBackButton = '//UIAApplication[1]/UIAWindow[1]/UIANavigationBar[1]/UIAButton[1]';
    var formatCellPartial = '//UIAApplication[1]/UIAWindow[1]/UIATableView[1]/UIATableCell[';
    var cellBelowAd = '//UIAApplication[1]/UIAWindow[1]/UIATableView[1]/UIATableCell[18]';
    var adCell = '//UIAApplication[1]/UIAWindow[1]/UIATableView[1]/UIATableCell[15]';
    var webViewCloseButton = '//UIAApplication[1]/UIAWindow[1]/UIAToolbar[1]/UIAButton[1]';

    for (var i = 0; i < formatNames.length; i++) {

      var formatName = formatNames[i];
      var navBarTitle = '';
      describe(formatName, function () {

        it('should open specific format tableview', function () {
          // UIAutomation element indices start at 1. We adjust accordingly
          formatIndex += 1;

          // scroll down if the format title is far down enough in the tableview
          if (formatIndex > 8) {
            driver.execute('mobile: scroll', [{ direction: 'down' }]);
          }

          // navigate to format's demo tableview and verify that the navbar title is different
          return driver
            .elementByXPath(navBarText)
            .then(function (element) {
              return element.getAttribute('value');
            })
            .then(function(text) {
              navBarTitle = text;
              return;
            })
            .elementByXPath(formatCellPartial + formatIndex + ']')
            .click()
            .sleep(1000)
            .elementByXPath(navBarText)
            .then(function (element) {
              return element.getAttribute('value');
            })
            .then(function (text) {
              return text.should.not.equal(navBarTitle);
            });
        });

        it('should open ad webview', function () {
          // formats 10, 11, and 12 do dot require button presses
          var button = (formatIndex > 9 && formatIndex < 13) ? '' : '/UIAButton[1]';

          /* just testing the height property here. Will use this to check if ad has loaded */
          // var element = driver.elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIATableView[1]/UIATableCell[3]');
          // var size = element.getSize().then(function(size) {
          //   console.log(size.height);
          // });

          return driver
            .elementByXPath(cellBelowAd)
            .click()
            .sleep(1000)
            .elementByXPath(adCell + button)
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
            .elementByXPath(webViewCloseButton)
            .click()
            .elementByXPath(navBarBackButton)
            .currentContext()
            .then(function (context) {
              return context.should.equal(nativeAppContext);
            });
        });

        // return to fomat list
        it('should navigate back to formats tableview', function () {
          return driver
            .sleep(1000)
            .elementByXPath(navBarBackButton)
            .click()
            .elementByXPath(navBarText)
            .then(function (element) {
              return element.getAttribute('value');
            })
            .then(function (text) {
              return text.should.equal(navBarTitle);
            });
        });
      });

    }

    before(function () {
      localServer.start();
      var serverConfig = serverConfigs.local;
      driver = wd.promiseChainRemote(serverConfig);
      require('../config/logging').configure(driver);

      var desired = _.clone(require('../config/caps').ios93);
      desired.app = '/Users/elbercarneiro/Desktop/Demo2.app';
      // if (process.env.npm_package_config_sauce) {
      //   desired.name = 'ios - local server';
      //   desired.tags = ['sample'];
      // }

      return driver.init(desired);
    });

    // CLOSE DRIVER AND CLEANUP
    after(function () {
      localServer.stop();
      return driver
        .quit()
        .finally(function () {
          // if (process.env.npm_package_config_sauce) {
          //   return driver.sauceJobStatus(allPassed);
          // }
        });
    });

    afterEach(function () {
      allPassed = allPassed && this.currentTest.state === 'passed';
    });

  };
}

describe('Demo 2', demo2Suite(formatNames));
