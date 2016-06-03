/* jshint node: true */

'use strict';

var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(__dirname + '/static'));

// app.get('/index.html', function (req, res) {
//   res.sendfile(path.resolve(__dirname, '../assets/index.html'));
// });

// app.get('/Demo2.app', function (req, res) {
//   res.sendfile(path.resolve(__dirname, '../assets/Demo2.app'));
// });

// app.get('/ApiDemos-debug.apk', function (req, res) {
//   res.sendfile(path.resolve(__dirname, '../../../../assets/ApiDemos-debug.apk'));
// });

var server;

exports.start = function () {
  server = app.listen(3000);
};

exports.stop = function () {
  server.close();
};
