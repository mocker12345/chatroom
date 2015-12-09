/**
 * Created by rancongjie on 15/12/8.
 */
var servers = require('http');
var chatServer = require('./lib/chat_server');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};



function send404(res) {
  res.writeHead(404, {'Content-Type': 'text-plain'});
  res.write('error:404');
  res.end();
}
function sendFiles(res, filePath, fileContents) {
  res.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath))});
  res.end(fileContents);
}

//缓存服务
function serverCache(res, cache, absPath) {
  if (cache[absPath]) {
    sendFiles(res, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, function (exists) {
      if (exists) {
        fs.readFile(absPath, function (err, data) {
          if (err) {
            send404(res);
          } else {
            cache[absPath] = data;
            sendFiles(res, absPath, data);
          }
        });
      } else {
        send404(res);
      }
    });
  }
}

var server = servers.createServer(function (req, res) {
  var filePath;
  if (req.url === '/') {
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + req.url;

  }
  var absPath = './' + filePath;
  serverCache(res, cache, absPath);

});

server.listen(3000, function () {
  console.log('服务启动');
});

chatServer.listen(server);