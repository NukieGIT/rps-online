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

socket.on("connect", () => {
    console.log(socket.id);
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
    console.log(e.code);
    e.preventDefault();
    if (e.code == "KeyR") {
        addChoice(rockImg, player1imgs);
    }
}

function addChoice(choice, player) {
    if (player.children.length >= 5) {
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
            lastElem.remove()
        }
    }
    const div = document.createElement("div");
    const img = document.createElement("img");
    div.classList.add(choiceImgClass);
    img.src = choice;
    div.append(img);
    player.prepend(div);
    // console.log([...player.children].at(-1));
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
