/**
 * Created by rancongjie on 15/12/12.
 */
var fs = require('fs');
var request = require('request');
var htmlParser = require('htmlparser');
var configFileName = './rss_file.txt';

function checkForRssFile() {
  fs.exists(configFileName, function (exists) {
    if (!exists) {
      return console.log('err');
    }
    next(configFileName);
  });
}
function readRssFile(configFileName) {
  fs.readFile(configFileName, function (err, data) {
    if (err) {
      throw  err
    }
    data = data.toString().replace(/^\s+|\s+$/g, '').split('\n');
    var random = Math.floor(Math.random() * data.length);
    next(data[random]);
  });
}

function downloadRssFeed(feedurl) {
  request({uri: feedurl}, function (err, res, body) {
    if (err) throw err;
    if (res.statusCode != 200) {
      throw  new Error('错误');
    }
    next(body);
  });
}
function parserFeed(rss) {
  var handler = new htmlParser.RssHandler();
  var parser = new htmlParser.Parser(handler);
  parser.parseComplete(rss);
  if (!handler.dom.items.length) {
    throw new Error('no rss item');
  }
  var item = handler.dom.items.shift();
  console.log(handler.dom.items);
  console.log(item.title);
  console.log(item.link);
}
var tasks = [checkForRssFile, readRssFile, downloadRssFeed, parserFeed];

function next(result) {
  var currentTask = tasks.shift();
  if (currentTask) {
    currentTask(result)
  }
}
next();
