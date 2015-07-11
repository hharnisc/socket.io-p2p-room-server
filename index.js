"use strict";

var server = require("http").createServer();
var io = require("socket.io")(server);
var p2pserver = require("socket.io-p2p-server").Server;
var CoreLogger = require("core-logger");

// log to console
var logger = new CoreLogger({
  label: "socket.io-p2p-room-server"
});

var maxRoomClients = 5;

server.listen(3030);

io.on("connection", function(socket){
  socket.on("create-room", function(roomId) {
    logger.info("created Room", {roomId: roomId});
    p2pserver(socket, null, {name: roomId});
  });
  socket.on("join-room", function(roomId){
    logger.info("attempting to join room", {userId: socket.id, roomId: roomId});
    if (roomId in io.sockets.adapter.rooms) {
      var room = io.sockets.adapter.rooms[roomId];
      var numClients = Object.keys(room).length;
      if (numClients >= maxRoomClients) {
        logger.info("room is full", {userId: socket.id, roomId: roomId});
        socket.emit("full-room");
      } else {
        socket.join(roomId);
        p2pserver(socket, null, {name: roomId});
        logger.info("room joined", {
          userId: socket.id,
          roomId: roomId,
          numClients: numClients
        });
      }
    } else {
      socket.emit("invalid-room");
    }
  });
});
