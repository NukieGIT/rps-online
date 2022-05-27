const p1Username = document.querySelector(".js-usernameP1");
const p1Score = document.querySelector(".js-scoreP1");
const p2Username = document.querySelector(".js-usernameP2");
const p2Score = document.querySelector(".js-scoreP2");
const player1imgs = document.querySelector(".player1imgs");
const player2imgs = document.querySelector(".player2imgs");
const choiceImgClass = "choiceImg";
const rockImg = "./client/rock1.png";
const paperImg = "./client/paper1.png";
const scissorsImg = "./client/scissors1.png";
let p1Choice;
let isUser1 = false;

const resultMap = {
    "KeyR": rockImg,
    "KeyP": paperImg,
    "KeyS": scissorsImg
}


socket.on("connect", () => {
    console.log(socket.id);
})

socket.on("winnerResult", (res) => {
    document.addEventListener("keydown", start)
    if (res.user1.socketID == socket.id) {
        isUser1 = true;
        console.log(res.user1.result);
        addChoice(resultMap[res.user2.choice], player2imgs);
        updateScore(isUser1, res);
    }else if (res.user2.socketID == socket.id) {
        isUser1 = false;
        console.log(res.user2.result);
        addChoice(resultMap[res.user1.choice], player2imgs);
        updateScore(isUser1, res);
    }
})

document.addEventListener("keydown", start)

function start(e) {
    e.preventDefault();
    if (e.code == "Space") {
        document.removeEventListener("keydown", start);
        document.addEventListener("keydown", handleKeyDown);
    }
}

function handleKeyDown(e) { 
    e.preventDefault();
    if (e.code == "KeyR") {
        p1Choice = e.code;
        addChoice(rockImg, player1imgs);
        emitChoice();
    }
    else if (e.code == "KeyP") {
        p1Choice = e.code;
        addChoice(paperImg, player1imgs);
        emitChoice();
    }
    else if (e.code == "KeyS") {
        p1Choice = e.code;
        addChoice(scissorsImg, player1imgs);
        emitChoice();
    }
};

function addChoice(choice, player) {
    document.removeEventListener("keydown", handleKeyDown);
    const div = document.createElement("div");
    const img = document.createElement("img");
    div.classList.add(choiceImgClass);
    img.src = choice;
    div.append(img);
    player.prepend(div);
    if (player.children.length > 5) {
        let i = -1
        let lastElem = [...player.children].at(i);
        while(lastElem.classList.contains("fadeOut")) {
            i--;
            lastElem = [...player.children].at(i);
        }
        lastElem.classList.add("fadeOut");
        lastElem.addEventListener("animationend", removeElem);
        function removeElem() {
            lastElem.removeEventListener("animationend", removeElem);
            lastElem.remove();
        }
    }
    if (player.children.length >= 1) {
        const firstElem = [...player.children][0];
        const lastElems = [...player.children];
        lastElems.forEach((elem, i) => {
            if (i == 0) return;
            const computedStylePos = window.getComputedStyle(firstElem).height;
            elem.style.top = (parseInt(computedStylePos) * i) + "px";
            elem.style.transform = "scale(.5)";
        })
    }
}

function updateScore(isUser1, res) {
    const user = isUser1 ? p1Score : p2Score;
    const secondUser = isUser1 ? p2Score : p1Score;
    user.textContent = res.user1.score;
    secondUser.textContent = res.user2.score;
}

function emitChoice() {
    const socketID = socket.id;
    const choice = p1Choice;
    socket.emit("reqRoomName", socketID, (callback) => {
        const roomName = callback.roomName
        socket.emit("userChoice", {socketID, roomName, choice});
    })
}

// const messageForm = document.querySelector(".js-message");
// const messageInput = document.querySelector("#js-messageInput");
// const msgsContainer = document.querySelector(".js-msgsContainer");

// messageForm.addEventListener("submit", e => {
//     e.preventDefault();
//     const socketID = socket.id;
//     const message = messageInput.value;
//     socket.emit("reqRoomName", socketID, (callback) => {
//         const roomName = callback.roomName
//         socket.emit("newMsg", {socketID, roomName, message});
//     });
//     appendMessage(`You: ${message}`)
// });

// socket.on("newMsg", (msg) => {
//     appendMessage(msg)
// })

// function appendMessage(msg) {
//     messageInput.value = "";
//     const elem = document.createElement("li");
//     elem.textContent = msg;
//     msgsContainer.append(elem);
// }
