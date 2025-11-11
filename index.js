const express = require('express');
const { clear } = require('node:console');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const playerPoints = {};
const app = express();
const server = createServer(app);
const io = new Server(server);
app.use('/', express.static('public'))
var users_live=0;

var bytesReceived = 0;
var bytesSent = 0;

var users_total = 0;
var Messages= [""];
var tick =0;
function EVALCOMMAND(args) {
let argsnew = args.substr(6);
if(argsnew.substr(0,4) == "test") {
  io.emit("M_recv","|ADMIN COMMAND| "+argsnew.substr(5));
} else if (argsnew == "broadcast") {
  
  
  
}

}
/*app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});*/
const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
server.listen(8080, () => {
  console.log('server running at http://localhost:8080');
});
io.on('connection', (socket) => {


socket.onAny((event, data) => {
  try {
    const size = Buffer.byteLength(JSON.stringify(data ?? ""));
    bytesReceived += size;
  } catch (err) {
    console.error(`Error measuring bytes for event "${event}":`, err);
  }
});


  const originalEmit = socket.emit;
  socket.emit = function (event, data) {
    const size = Buffer.byteLength(JSON.stringify(data));
    bytesSent += size;
    return originalEmit.apply(this, arguments);
  };


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
  socket.on('voice', (data) => {
    //socket.broadcast.emit('voice', data); // send to everyone else
    io.emit('voice',data);
    console.log("voice->"+data);
  });

  socket.on("message",(data) => {
    if(cyrb53(data.substr(1,4),32) ==6846507086430138 ) {//>EXEC
      EVALCOMMAND(data);
    } else {
    Messages.push(data);
    console.log(data);
    if(data.length < 300) {
    io.emit("M_recv",data);
    } else {
    io.emit("M_recv","ömer siteye giriş yapmış");
    }
    }
  });
  socket.on("synct",(data) => {//socket.emit("BC","message")
    socket.emit("T_SYNC",tick);
  });
  socket.on("mouseClick",(data) => {
    io.emit("Click",data);
  })
  socket.on("mousemove",(data) => {
    io.emit("Click",data)
  })
  socket.on("BC",(data) => {//socket.emit("BC","message")
    Messages.push(data);
    console.log("broadcast ->"+data);
    
    if(cyrb53(data,32) == 5080827283565467) {
      Messages.length = 0;
      io.emit("clear");
      io.emit("M_recv","An admin cleared the messages")
    } else if(data.length < 300) {
    io.emit("BROADCAST",data);
    }
  });
});

app.get('/userlive', (req, res) => {
  res.send(users_live);
});
app.get('/recv', (req, res) => {
  res.send(bytesReceived);
});
app.get('/sent', (req, res) => {
  res.send(bytesSent);
});
app.get('/usertotal', (req, res) => {
  res.send(users_total);
});
app.get('/uptime', (req, res) => {
  res.send(tick);
});
app.get('/memoryusage', (req, res) => {
  res.send(process.memoryUsage());
});
app.get('/api/getpoint/:username', (req, res) => {
  const { username } = req.params;
  const points = playerPoints[username] ?? 0;
  res.json({ username, points });
});
app.get('/api/increment/:username', (req, res) => {
  const { username } = req.params;
  const points = playerPoints[username] ?? 0;
  if(playerPoints[username] == null) {
    playerPoints[username] = 0;
  } else {
    playerPoints[username] ++;
  }
  res.json({ username, points });
});

setInterval(function() {
    tick++;
    if (tick % 30 === 0) {
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



