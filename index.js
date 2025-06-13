const express = require('express');
const {createServer} = require('node:http');
const {Server} = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);
app.use('/', express.static('public'))
let users_live = 0;
let users_total = 0;
let Messages = [""];
let tick = 0;
/*app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});*/

server.listen(8080, () => {
    console.log('server running at http://localhost:8080');
});

// for race condition prevention
const userCountLock = {locked: false, queue: []};

function acquireLock(cb) {
    if (!userCountLock.locked) {
        userCountLock.locked = true;
        cb(releaseLock);
    } else {
        userCountLock.queue.push(cb);
    }
}

function releaseLock() {
    if (userCountLock.queue.length > 0) {
        const next = userCountLock.queue.shift();
        next(releaseLock);
    } else {
        userCountLock.locked = false;
    }
}

io.on('connection', (socket) => {
    acquireLock((release) => {
        users_live++;
        users_total++;
        io.emit("update", users_live);
        io.emit("update_total", users_total);
        release();
    });

    for (let i = 0; i < Messages.length; i++) {
        socket.emit("M_recv", Messages[i]);
    }

    socket.on("disconnect", (_socket) => {
        acquireLock((release) => {
            users_live--;
            io.emit("update", users_live);
            io.emit("update_total", users_total);
            release();
        });
    });

    // Rate limiting: a message per 800 ms
    if (!socket.lastMessageTime) socket.lastMessageTime = 0;
    socket.on("message", (data) => {
        const now = Date.now();
        if (now - socket.lastMessageTime < 800) {
            socket.emit("M_recv", "You are sending messages too quickly. Please wait.");
            return;
        }
        socket.lastMessageTime = now;
        Messages.push(data);
        console.log(data);
        if (data.length < 300) {
            io.emit("M_recv", data);
        } else {
            io.emit("M_recv", "Data length exceeds 300 characters.");
        }
    });
});
setInterval(function () {
    tick++;
    if (tick % 10 === 0) {
        Messages.push("" + `--------${600 - tick} seconds until reset--------`);
        io.emit("M_recv", "" + `--------${600 - tick} seconds until reset--------`);

        console.log(`--------${600 - tick} seconds until reset--------`);
    }

    if (tick % 600 === 0) {
        Messages = [];
        console.log("clearing...");
        Messages.push("--------Messages reset!--------");
        io.emit("clear")
    }
}, 10000); // Runs every 10 seconds