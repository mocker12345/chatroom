/**
 * Created by rancongjie on 15/12/8.
 */
var socketIo = require('socket.io');
var io;
var guestNumber = 1;
var nikeNames = {};
var nameUsed = [];
var currentRoom = {};

exports.listen = function (server) {
  io = socketIo.listen(server);
  io.set('log level', 1);
  io.sockets.on('connection', function (socket) {
    guestNumber = assignGuestName(socket, guestNumber, nikeNames, nameUsed);
    joinRoom(socket, 'lobby');
    handleMessageBroadcasting(socket, nikeNames);
    handleNameChangeAttempts(socket, nikeNames, nameUsed);
    handleRoomJoin(socket);
    socket.on('rooms', function () {
      socket.emit('rooms', io.sockets.manager.rooms)
    });
    handleClientDisConnection(socket, nikeNames, nameUsed);
  });
};

function assignGuestName(socket, guestNumber, nikeNames, nameUsed) {
  var name = 'Guest' + guestNumber;
  nikeNames[socket.id] = name;
  socket.emit('nameResult', {
    name: name,
    success: true
  });
  nameUsed.push(name);
  return guestNumber + 1;
}
function joinRoom(socket, room) {
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit('joinResult', {room: room});
  socket.broadcast.to(room).emit('message', {
    text: nikeNames[socket.id] + 'has join.'
  });
  var userInRoom = io.sockets.clients(room);
  if (userInRoom.length > 1) {
    var userInRoomSummary = 'User currently in' + room + ':';
    for (var index in userInRoom) {
      var userSocketId = userInRoom[index].id;
      if (userSocketId != socket.id) {
        if (index > 0) {
          userInRoomSummary += ', '
        }
      }
      userInRoomSummary += nikeNames[userSocketId];
    }
  }
  socket.emit('message', {text: userInRoomSummary});
}
function handleMessageBroadcasting(socket) {
  socket.on('message', function (message) {
    console.log(message.room);
    socket.broadcast.to(message.room).emit('message', {
      text: nikeNames[socket.id] + ':' + message.text
    });
  });
}
function handleNameChangeAttempts(socket, nikeNames, nameUsed) {
  socket.on('nameAttempt', function (name) {
    if (name.indexOf('Guest') == 0) {
      socket.emit('nameResult', {
        success: false,
        message: 'cannot begin with guest'
      });
    } else {
      if (nameUsed.indexOf(name) == -1) {
        var prevName = nikeNames[socket.id];
        var prevNameIndex = nameUsed.indexOf(prevName);
        nameUsed.push(name);
        nikeNames[socket.id] = name;
        delete nameUsed[prevNameIndex];
        socket.emit('nameResult', {
          success: true,
          name: name
        });
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: prevName + ' change name to ' + name
        });
      } else {
        socket.emit('nameResult', {
          success: false,
          message: 'that name is already in use'
        });
      }
    }
  });
}

function handleRoomJoin(socket) {
  socket.on('join', function (room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
}

function handleClientDisConnection(socket, nikeNames, nameUsed) {
  socket.on('disconnect', function () {
    var nameIndex = nameUsed.indexOf(nikeNames[socket.id]);
    delete nikeNames[socket.id];
    delete nameUsed[nameIndex];
  });
}
