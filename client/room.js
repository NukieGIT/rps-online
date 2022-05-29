const p1Username = document.querySelector(".js-usernameP1");
const p1Score = document.querySelector(".js-scoreP1");
const p2Username = document.querySelector(".js-usernameP2");
const p2Score = document.querySelector(".js-scoreP2");
const player1imgs = document.querySelector(".player1imgs");
const player2imgs = document.querySelector(".player2imgs");
const visualScore = document.querySelector(".visualScore");
const choiceImgClass = "choiceImg";
const winClass = "roundWon";
const loseClass = "roundLost";
const tieClass = "roundTied";
const imgOpacityClass = "imgLost";
const rockImg = "./client/rock1.png";
const paperImg = "./client/paper1.png";
const scissorsImg = "./client/scissors1.png";
let p1Choice;
let isUser1 = false;
let imgChoice;

const resultMap = {
    "KeyR": rockImg,
    "KeyP": paperImg,
    "KeyS": scissorsImg
}


socket.on("connect", () => {
    console.log(socket.id);
})

socket.on("winnerResult", (res) => {
    document.addEventListener("keydown", handleKeyDown);
    if (res.user1.socketID == socket.id) {
        isUser1 = true;
        console.log(res.user1.result);
        imgChoice.img1.src = resultMap[res.user2.choice];
        lowerLoserOpacity(res.user1.result)
        updateScore(isUser1, res);
        visualResult(res.user1.result);
    }else if (res.user2.socketID == socket.id) {
        isUser1 = false;
        console.log(res.user2.result);
        imgChoice.img1.src = resultMap[res.user1.choice];
        lowerLoserOpacity(res.user2.result)
        updateScore(isUser1, res);
        visualResult(res.user2.result);
    }
    if (res.state.finished) {
        document.removeEventListener("keydown", handleKeyDown);
        console.log("OVERALL WINNER:", res.state.winner);
        if (res.state.winner == socket.id) {
            console.log("YOU WON!!!11!111");
        } else {
            console.log("YOU LOST!!!11!111");
        }
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
        imgChoice = addChoice();
        imgChoice.img0.src = rockImg;
        emitChoice();
    }
    else if (e.code == "KeyP") {
        p1Choice = e.code;
        imgChoice = addChoice();
        imgChoice.img0.src = paperImg;
        emitChoice();
    }
    else if (e.code == "KeyS") {
        p1Choice = e.code;
        imgChoice = addChoice();
        imgChoice.img0.src = scissorsImg;
        emitChoice();
    }
};

function addChoice() {
    let obj = {};
    [player1imgs, player2imgs].forEach((elem1, i) => {
        const div = document.createElement("div");
        const img = document.createElement("img");
        div.classList.add(choiceImgClass);
        div.append(img);
        elem1.prepend(div);
        if (elem1.children.length > 5) {
            let i = -1
            let lastElem = [...elem1.children].at(i);
            while(lastElem.classList.contains("fadeOut")) {
                i--;
                lastElem = [...elem1.children].at(i);
            }
            lastElem.classList.add("fadeOut");
            lastElem.addEventListener("animationend", removeElem);
            function removeElem() {
                lastElem.removeEventListener("animationend", removeElem);
                lastElem.remove();
            }
        }
        if (elem1.children.length >= 1) {
            const firstElem = [...elem1.children][0];
            const lastElems = [...elem1.children];
            lastElems.forEach((elem, i) => {
                if (i == 0) return;
                const computedStylePos = window.getComputedStyle(firstElem).height;
                elem.style.top = (parseInt(computedStylePos) * i) + "px";
                elem.style.transform = "scale(.5)";
            })
        }
        obj[`img${i}`] = img;
    })
    return obj;
}

function updateScore(isUser1, res) {
    const user = isUser1 ? p1Score : p2Score;
    const secondUser = isUser1 ? p2Score : p1Score;
    user.textContent = res.user1.score;
    secondUser.textContent = res.user2.score;
}

function emitChoice() {
    document.removeEventListener("keydown", handleKeyDown);
    const socketID = socket.id;
    const choice = p1Choice;
    socket.emit("reqRoomName", socketID, (callback) => {
        const roomName = callback.roomName
        socket.emit("userChoice", {socketID, roomName, choice});
    })
}

function visualResult(viResult) {
     visualScore.classList.remove(winClass, loseClass, tieClass); 
    if (viResult == "You Win!") {
        visualScore.classList.add(winClass);
    } else if(viResult == "You Lose!"){
        visualScore.classList.add(loseClass);
    }else if(viResult == "tie"){
        visualScore.classList.add(tieClass);
    }
}

function lowerLoserOpacity(userResult) {
    if (userResult == "tie") return;
    if (userResult == "You Lose!") {
        imgChoice.img0.classList.add(imgOpacityClass);
    } else {
        imgChoice.img1.classList.add(imgOpacityClass);
    }
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
