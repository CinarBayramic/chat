const express = require('express');
const { clear } = require('node:console');
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
  console.log('server running at http://localhost:8080');
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
  socket.on("synct",(data) => {//socket.emit("BC","message")
    socket.emit("T_SYNC",tick);
  });
  socket.on("BC",(data) => {//socket.emit("BC","message")
    Messages.push(data);
    console.log("broadcast"+data);
    if(data.length < 300) {
    io.emit("BROADCAST",data);
    }
  });
});
setInterval(function() {
    tick++;
    if (tick % 10 === 0) {
        Messages.push(""+`--------${600-(tick%600)} seconds until reset--------`);
        io.emit("M_recv",""+`--------${600-(tick%600)} seconds until reset--------`);

        console.log(`--------${600-(tick%600)} seconds until reset--------`);
    }
    
    if (tick % 600  === 0) {
        Messages.length = 0;
        console.log("clearing...");
        Messages.push("--------Messages reset!--------");
        io.emit("clear")
    }
}, 1000); // Runs every second
