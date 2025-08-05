const socket = io();

const smurfNames = ["Boeren Smurf", "Bolle Gijs", "Bril Smurf", "Chloorhydris", "Droom Smurf", "Eenzame Smurf", "Gargamel", "Gnoef", "Greintje", "Grote Smurf", "Hippe Smurf", "Kleermaker Smurf", "Laconia", "Lol Smurf", "Marco Smurf", "Natuur Smurf", "Puppie", "Robot Smurf", "Schilder Smurf", "Smul Smurf", "Smurf", "Smurfin", "Speuder Smurf", "Vlieg Smurf"];

var ownCardIndx = 0;
var color = "";
var opponentColor = "";
var yourTurn = false;
var questionAsked = false;
var onFinalCard = false;


function amountDeselectedCards() {
    const game = document.getElementById("game");

    var amount = 0
    for (var row of game.childNodes) {
        for (var cell of row.childNodes) {
            amount += cell.firstChild.classList.contains("notIt");
        }
    }

    return amount
}

function celClicked(event) {
    if (event.button != 0) return

    switch (getView()) {
        case "gameView":
            event.srcElement.classList.toggle("notIt");
            if (amountDeselectedCards() == cells.length - 1) onFinalCard = true
            break;
        case "cardSelectView":
            const cell = event.srcElement.parentElement;
            ownCardIndx = cells.findIndex((checkCell) => { return cell.isEqualNode(checkCell); });

            switchToView("homeView");
            setupOwnCard();
            break;
    }

}

function createCells(borderColor = "") {
    var newCells = []
    for (var y = 0; y < 3; y++) {
        for (var x = 0; x < 8; x++) {
            const cel = document.createElement("td");
            const card = document.createElement("div");
            const name = document.createElement("p");

            card.style.backgroundPosition = "-" + (x * 200) + "px -" + (y * 200) + "px";
            if (borderColor != "") card.style.borderColor = borderColor;
            card.classList.add("card");
            card.addEventListener("mousedown", celClicked);
            name.innerText = smurfNames[y * 8 + x];

            card.appendChild(name);
            cel.appendChild(card);
            newCells.push(cel);
        }
    }

    return newCells;
}

function setupCells(id) {
    const elment = document.getElementById(id)
    elment.innerHTML = "";

    const newCells = createCells(color);
    const cellsPerRow = Math.floor((window.innerWidth - 240) / 200) - 1

    var row = document.createElement("tr");
    for (var i = 0; i < newCells.length; i++) {
        row.appendChild(newCells[i]);

        if (i % cellsPerRow !== cellsPerRow - 1 && i !== newCells.length - 1) continue;

        elment.appendChild(row);
        row = document.createElement("tr");
    }
}

function setCardToCell(card, cell) {
    const backgroundPos = cell.firstChild.style.backgroundPosition;
    const borderColor = cell.firstChild.style.borderColor;

    card.style.backgroundPosition = backgroundPos;
    card.style.borderColor = borderColor;
    card.innerHTML = cell.firstChild.innerHTML;
}

function setupOwnCard() {
    setCardToCell(document.getElementById("yourCard"), cells[ownCardIndx]);
    setCardToCell(document.getElementById("cardSelect"), cells[ownCardIndx]);
}

function switchToView(viewID) {
    document.getElementById(viewID).classList.remove("hide");

    var allViews = document.getElementsByClassName("view")

    for (var i = 0; i < allViews.length; i++) {
        var view = allViews[i];

        if (view.id == viewID) continue;

        view.classList.add("hide");
    }
}

function getView() {
    var views = document.querySelectorAll("div.view");

    for (var i = 0; i < views.length; i++) {
        var view = views[i];

        if (view.classList.contains("hide")) continue;

        return view.id;
    }
}

function focusOnInput(event) {
    const elment = event.target;

    if (elment.classList.contains("emptyText")) {
        elment.value = "";
        elment.classList.remove("emptyText");
    }
}

function blurInput(event) {
    const elment = event.target;

    elment.classList.add("emptyText");
    elment.value = elment.dataset.defaultvalue
}

function addEventListenerFromID(id, event, exec) {
    document.getElementById(id).addEventListener(event, exec);
}

addEventListenerFromID("startGame", "mouseup", () => {
    socket.emit("joinGame", { "card": ownCardIndx })
})

socket.on("waitForPlayer", () => {
    switchToView("waitView")
})

socket.on("startgame", (data) => {
    color = data.color;
    opponentColor = data.opponentColor;

    switchToView("gameView")

    cells = createCells(color);
    setupOwnCard();
    setupCells("game");
})

socket.on("startTurn", (data) => {
    yourTurn = data.turn == color;

    const turnAnimation = document.getElementById("turnAnimation")
    turnAnimation.children[0].innerText = (yourTurn ? "your" : opponentColor + "'s") + " turn"
    turnAnimation.classList.add("turnAnimation")
    addEventListenerFromID("turnAnimation", "animationend", () => { turnAnimation.classList.remove("turnAnimation") })

    questionAsked = false;
    setMessageOptions();
})

addEventListenerFromID("cardSelect", "mousedown", () => { switchToView("cardSelectView"); })

addEventListenerFromID("chatInput", "keydown", (event) => {
    if (event.key != "Enter") return;
    if (!yourTurn) return;

    const value = document.querySelector("input#chatInput").value;
    if (value == "") return;

    socket.emit('question', value);
    addMessage(value, color);

    questionAsked = true;
    document.getElementById("chatInput").classList.add("hide");

    document.querySelector("input#chatInput").value = "";
})

addEventListenerFromID("chatInput", "focusin", focusOnInput);

addEventListenerFromID("chatInput", "blur", blurInput);

function addMessage(message, color) {
    var elmt = document.createElement("p");
    elmt.innerHTML = message;
    elmt.style.color = color

    const children = document.getElementById("messages").children;
    document.getElementById("messages").insertBefore(elmt, children[0]);
}

function setMessageOptions() {
    document.getElementById("chatInput").classList.add("hide");
    document.getElementById("endTurnButton").classList.add("hide");
    document.getElementById("answerButtons").classList.add("hide");
    document.getElementById("guessCardButton").classList.add("hide");

    if (yourTurn && questionAsked) {
        document.getElementById("endTurnButton").classList.remove("hide");
        return;
    }

    if (yourTurn && !questionAsked && !onFinalCard) {
        document.getElementById("chatInput").classList.remove("hide");
        return;
    }

    if (yourTurn && !questionAsked && onFinalCard) {
        document.getElementById("guessCardButton").classList.remove("hide");
        return;
    }

    if (!yourTurn && questionAsked) {
        document.getElementById("answerButtons").classList.remove("hide");
        return;
    }
}

addEventListenerFromID("endTurnButton", "click", () => {
    socket.emit("endTurn");
})

function onDisconnect() {
    document.getElementById("resualtText").innerText = "Game ended from disconnection.";
    document.getElementById("showCards").style.display = "none";

    switchToView("endView")
}

socket.on("disconnect", onDisconnect)

socket.on("gameEnd", (data) => {
    if (data.won != undefined) {
        const youWon = data.won == color;

        document.getElementById("resualtText").innerText = "you " + (youWon ? "won" : "lost");

        const greenCard = document.createElement("div");
        greenCard.classList.add("card");
        setCardToCell(greenCard, cells[data.greenCard]);
        greenCard.style.borderColor = "green";
        document.getElementById("showCards").appendChild(greenCard);

        const redCard = document.createElement("div");
        redCard.classList.add("card");
        setCardToCell(redCard, cells[data.redCard]);
        redCard.style.borderColor = "red";
        document.getElementById("showCards").appendChild(redCard);

        switchToView("endView")
    }

    if (data.error === "disconnect") {
        onDisconnect();
    }
})

addEventListenerFromID("guessCardButton", "click", () => {
    var cardGuess = ""
    for (var row of document.getElementById("game").childNodes) {
        for (var cell of row.childNodes) {
            if (cell.firstChild.classList.contains("notIt")) {
                cardGuess = cell.firstChild.firstChild.innerText;
                break;
            }
        }
        if (cardGuess !== "") break;
    }

    cardGuess = smurfNames.indexOf(cardGuess) - 1;

    if (cardGuess === -1) return;

    socket.emit("guessCard", cardGuess);
})

addEventListenerFromID("yesButton", "click", answer);
addEventListenerFromID("noButton", "click", answer);

function answer(event) {
    const value = event.srcElement.value
    socket.emit("answer", value);
    addMessage(value, color);

    document.getElementById("answerButtons").classList.add("hide");
}

socket.on("answer", (msg) => {
    addMessage(msg, opponentColor);
    setMessageOptions();
});

socket.on("question", (msg) => {
    addMessage(msg, opponentColor);

    questionAsked = true;
    setMessageOptions();
})

window.addEventListener("resize", () => {
    setupCells("game");
    setupCells("cardSelectTable");
})

var cells = createCells();

switchToView("homeView");
setupCells("game");
setupCells("cardSelectTable");
setupOwnCard();