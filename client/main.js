const socket = io();

var ownCardIndx = 0;
var name = "";

function celClicked(event) {
    if (event.button != 0) return

    switch (getView()) {
        case "gameView":
            event.srcElement.classList.toggle("notIt");
            break;
        case "cardSelectView":
            const cell = event.srcElement.parentElement;
            ownCardIndx = cells.findIndex((checkCell) => { return cell.isEqualNode(checkCell); });

            switchToView("homeView");
            setupOwnCard();
            break;
    }

}

function createCells() {
    var newCells = []
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 6; x++) {
            const cel = document.createElement("td");
            const card = document.createElement("div");
            card.style.backgroundPosition = "-" + (x * 145 + 25) + "px -" + (y * 195.5 + 18) + "px";
            card.classList.add("card");
            card.addEventListener("mousedown", celClicked);
            cel.appendChild(card);
            newCells.push(cel);
        }
    }

    return newCells;
}

function setupCells(id) {
    const elment = document.getElementById(id)
    elment.innerHTML = "";

    const newCells = createCells();

    for (var i = 0; i < 3; i++) {
        const row = document.createElement("tr");
        for (var i2 = 0; i2 < 8; i2++) row.appendChild(newCells[i * 8 + i2]);
        elment.appendChild(row);
    }
}

function setCardToCell(card, cell) {
    const backgroundPos = cell.childNodes[0].style.backgroundPosition;

    card.style.backgroundPosition = backgroundPos;
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

    if (elment.value !== "") {
        name = elment.value
        return;
    }

    elment.classList.add("emptyText");
    elment.value = elment.dataset.defaultvalue
}

function addEventListenerFromID(id, event, exec) {
    document.getElementById(id).addEventListener(event, exec);
}

addEventListenerFromID("startGame", "mouseup", () => {
    if (name == "") return

    switchToView("gameView");

    socket.emit("joinGame", { "card": ownCardIndx, "name": name })
})

addEventListenerFromID("cardSelect", "mousedown", () => { switchToView("cardSelectView"); })

addEventListenerFromID("nameInput", "focusin", focusOnInput);

addEventListenerFromID("nameInput", "blur", blurInput)

addEventListenerFromID("chatInput", "keydown", (event) => {
    if (event.key != "Enter") return;

    const value = document.querySelector("input#chatInput").value;
    if (value == "") return;

    socket.emit('chat message', value);
    addMessage(value);

    document.querySelector("input#chatInput").value = "";
})

addEventListenerFromID("chatInput", "focusin", focusOnInput);

addEventListenerFromID("chatInput", "blur", blurInput);

function addMessage(message) {
    var elmt = document.createElement("h3");
    elmt.innerHTML = message;

    const children = document.getElementById("messages").children;
    document.getElementById("messages").insertBefore(elmt, children[0]);
}

socket.on("chat message", (msg) => {
    addMessage(msg);
})

var cells = createCells();

switchToView("homeView");
setupCells("game");
setupCells("cardSelectTable");
setupOwnCard();