const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);
app.use('/', express.static('public'))
var users_live=0;
var users_total = 0;
var Messages= [""];
/*app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});*/

server.listen(8080, () => {
  console.log('server running at http://localhost:3000');
});
io.on('connection', (socket) => {
  users_live++;
  users_total++;
  console.log('user count->'+users_live);
  for(let i = 0; i < Messages.length;i++) {socket.emit("M_recv",Messages[i])}
  io.emit("update",users_live)
  io.emit("update_total",users_total)
  socket.on("disconnect",(socket) => {
    users_live--;
    io.emit("update",users_live)
    io.emit("update_total",users_total)
  });
  socket.on("message",(data) => {
    Messages.push(data);
    console.log(data);
    io.emit("M_recv",data);
  });
});