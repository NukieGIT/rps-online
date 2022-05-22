const express = require("express");
const app = express();
const path = require("path")

const http = require("http").Server(app);
const port = 3000;

// attach http server to Socket.io
const io = require("socket.io")(http);


// route
app.use(express.static(path.join(__dirname, "../")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"))
})

app.route("/room.html").get((req, res) => {
    res.sendFile(path.join(__dirname, "../client/room.html"))
})

http.listen(port, () => {
    console.log(`App listenning on port:${port}`);
})

let rooms = [];

// create a new connection
io.on("connection", socket => {
    console.log(socket.id);
    // handle room creation
    socket.on("createRoom", (req, callback) => {
        if (!rooms.some(e => e.roomName == req.roomName)) {
            // tell the client to redirect
            callback({
                done: true
            })
            // save created room
            const obj = {};
            obj["roomName"] = req.roomName;
            obj["users"] = [req.socketID];
            rooms.push(obj);
            socket.join(req.roomName);
        } else {
            socket.emit("error", `${req.roomName} already exists!`)
        }

        console.log(JSON.stringify(rooms, null, 4));
        console.log(io.sockets.adapter.rooms);
    })
    socket.on("joinRoom", (req, callback) => {
        if (rooms.some(e => e.roomName == req.roomName)) {
            rooms.find(e => {
                if (e.roomName == req.roomName && e.users.length < 2) {
                    // tell the client to redirect
                    callback({
                        done: true
                    })
                    // add user to room table
                    e.users.push(req.socketID);
                    socket.join(req.roomName);
                } else {
                    socket.emit("error", `${req.roomName} is full!`)
                }
            });
        } else {
            socket.emit("error", `${req.roomName} doesn't exist!`)
        }

        console.log(JSON.stringify(rooms, null, 4));
        console.log(io.sockets.adapter.rooms);
    })
    // respond to client with his cureent room name
    socket.on("reqRoomName", (socketID, callback) => {
        rooms.find(e => {
            if (e.users.includes(socketID)) {
                callback({
                    "roomName": e.roomName
                })
            }
        })
    })

    

    // handle new messages
    socket.on("newMsg", (msg) => {
        socket.broadcast.to(msg.roomName).emit("newMsg", `${msg.socketID}: ${msg.message}`);
    })
})