const socket = io();
const joinForm = document.querySelector(".js-join");
const createForm = document.querySelector(".js-create");
const joinInput = document.querySelector("#js-joinInput");
const createInput = document.querySelector("#js-createInput");


socket.on("connect", () => {
    console.log(socket.id);
})


joinForm.addEventListener("submit", e => {
    e.preventDefault();
    const roomName = joinInput.value;
    const socketID = socket.id;
    socket.emit("joinRoom", {roomName, socketID}, callback => {
        if (callback.done) {
            loadRoom("./room.html")
        };
    });
});

createForm.addEventListener("submit", e => {
    e.preventDefault();
    const roomName = createInput.value;
    const socketID = socket.id;
    socket.emit("createRoom", {roomName, socketID}, callback => {
        if (callback.done) {
            loadRoom("./room.html")
        };
    });
});


function loadRoom(url) {
    fetch(url).then(res => res.text())
    .then(data => {
        document.write(data)
        const script = document.createElement("script");
        document.head.appendChild(script);
        script.src = "./client/room.js"
        const style = document.createElement("link")
        document.head.appendChild(style);
        style.rel = "stylesheet";
        style.href = "./client/room.css";
    })
}

socket.on("error", (err) => {
    console.log(err);
})
    

