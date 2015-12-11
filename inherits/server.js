/**
 * Created by rancongjie on 15/12/11.
 */
var event = require('events');
var util = require('util');
var fs = require('fs');

function Watcher(watchDir, processDir) {
  this.watchDir = watchDir;
  this.processDir = processDir;
}

util.inherits(Watcher, event.EventEmitter);

Watcher.prototype.watch = function () {
  var watcher = this;
  fs.readdir(this.watchDir, function (err, files) {
    if (err) return console.log(err);
    for (var index in files) {
      watcher.emit('process', files[index]);
    }
  });
};
Watcher.prototype.start = function () {
  var watcher = this;
  fs.watchFile(this.watchDir, function () {
    watcher.watch();
  })
};

var watcher = new Watcher('./watch', './done');

watcher.on('process', function (file) {
  //console.log(file);
  var watcherDir = this.watchDir + '/' + file;
  var processDir = this.processDir + '/' + file.toLowerCase();
  fs.rename(watcherDir, processDir, function (err) {
    if (err) return console.log(err);
  })
});
watcher.start();