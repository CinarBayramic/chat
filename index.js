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
var tick =0;
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
    console.log('user count->'+users_live);
  });
  socket.on("message",(data) => {
    Messages.push(data);
    console.log(data);
    if(data.length < 300) {
    io.emit("M_recv",data);
    } else {
    io.emit("M_recv","ömer siteye giriş yapmış");
    }
  });
});
setInterval(function() {
    tick++;
    if (tick % 3 === 0) {
        Messages.push("--------30 seconds until reset--------");
    }
    
    if (tick % 60 === 0) {
        Messages.length = 0;
        console.log("clearing...");
        Messages.push("--------Messages reset!--------");
    }
}, 1000); // Runs every second