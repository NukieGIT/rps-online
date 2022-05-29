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
const possibleChoices = ["KeyR", "KeyP", "KeyS"];
const combinations = [
    ["t", "p2", "p1"],
    ["p1", "t", "p2"],
    ["p2", "p1", "t"]
];
const resultMap = {
    "t": "tie",
    "p1": "You Win!",
    "p2": "You Lose!"
}

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
            obj["users"] = [{socketID: req.socketID, choice: null, score: 0}];
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
                    e.users.push({socketID: req.socketID, choice: null, score: 0});
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
        rooms.some(e1 => {
            e1.users.find(e => {
                if (e.socketID == socketID) {
                    callback({
                        "roomName": e1.roomName
                    })
                }
            })
        })
    })

    socket.on("userChoice", (req) => {
        rooms.some(e1 => {
            if (e1.roomName == req.roomName) {
                const user = req.socketID;
                e1.users.find(e => {
                    if (e.socketID == user) {
                        e.choice = req.choice
                        const room = e1;
                        if (room.users.every(e => e.choice !== null)) {
                            const users = room.users.map(e => e);
                            io.to(req.roomName).emit("winnerResult", checkWin(user, users));
                            users.forEach(elem => {
                                elem.choice = null;
                            });
                        }
                    }
                })
            }
        })
    })
    
    function checkWin(user, users) {
        const user2 = users.filter(e => user !== e.socketID);
        const user1 = users.filter(e => user2[0].socketID !== e.socketID);
        const user1ChoiceIndex = possibleChoices.indexOf(user1[0].choice);
        const user2ChoiceIndex = possibleChoices.indexOf(user2[0].choice);
        const resultp1 = combinations[user1ChoiceIndex][user2ChoiceIndex];
        const resultp2 = combinations[user2ChoiceIndex][user1ChoiceIndex];
        const shouldEnd = updateScore(user1, user2, resultp1, resultp2, user1ChoiceIndex, user2ChoiceIndex);
        return {user1: {
                socketID: user1[0].socketID,
                result: resultMap[resultp1],
                choice: user1[0].choice,
                score: user1[0].score
            },
            user2: {
                socketID: user2[0].socketID,
                result: resultMap[resultp2],
                choice: user2[0].choice,
                score: user2[0].score
            },
            state: {
                finished: shouldEnd,
                winner: user1[0].score == 3 ? user1[0].socketID : user2[0].socketID
            }
        };
    }

    function updateScore(user1, user2, resultp1, resultp2) {
        if (resultMap[resultp1] == "You Win!") {
            user1[0].score += 1;
        } else if (resultMap[resultp2] == "You Win!") {
            user2[0].score += 1;
        }
        if (user1[0].score == 3 || user2[0].score == 3) {
            return true;
        }
        return false;
    }

    // handle new messages
    socket.on("newMsg", (msg) => {
        io.broadcast.to(msg.roomName).emit("newMsg", `${msg.socketID}: ${msg.message}`);
    })
})
