const socket = io();

var ownCardIndx = 0;

function celClicked(event) {
    if (event.button != 0) return

    switch (getView()) {
        case "gameView":
            event.srcElement.classList.toggle("notIt");
            break;
        case "cardSelectView":
            const cell = event.srcElement.parentElement;
            ownCardIndx = cells.indexOf(cell);
            switchToView("homeView");
            setupOwnCard();
            break;
    }

}

var cells = [];
for (var y = 0; y < 4; y++) {
    for (var x = 0; x < 6; x++) {
        const cel = document.createElement("td");
        const card = document.createElement("div");
        card.style.backgroundPosition = "-" + (x * 145 + 25) + "px -" + (y * 195.5 + 18) + "px";
        card.classList.add("card");
        card.addEventListener("mousedown", celClicked);
        cel.appendChild(card);
        cells.push(cel);
    }
}

function setupCells(id) {
    document.getElementById(id).innerHTML = "";

    for (var i = 0; i < 3; i++) {
        const row = document.createElement("tr");
        for (var i2 = 0; i2 < 8; i2++) row.appendChild(cells[i * 8 + i2]);
        document.getElementById(id).appendChild(row);
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

document.getElementById("startGame").addEventListener("mouseup", () => { switchToView("gameView"); })

document.getElementById("cardSelect").addEventListener("mousedown", () => { switchToView("cardSelectView"); })

document.getElementById("nameInput").addEventListener("focusin", (event) => {
    const elment = event.target;

    if (elment.classList.contains("emptyText")) {
        elment.value = "";
        elment.classList.remove("emptyText");
    }
})

document.getElementById("nameInput").addEventListener("blur", (event) => {
    const elment = event.target;

    if (elment.value !== "") return;

    elment.classList.add("emptyText");
    elment.value = "name"
})

//code for chat function. Which I will fully implement later
/* 
document.querySelector("input#chatInput").addEventListener("keydown", (event) => {
    if (event.key != "Enter") return;

    const value = document.querySelector("input#chatInput").value;
    if (value == "") return;

    socket.emit('chat message', value);
    addMessage(value);

    document.querySelector("input#chatInput").value = "";
})

function addMessage(message) {
    var elmt = document.createElement("h3");
    elmt.innerHTML = message;
    document.getElementById("messages").appendChild(elmt);

    const children = document.getElementById("messages").children;
    while (document.getElementById("messages").clientHeight - children[0].clientHeight > window.innerHeight) {
        console.log(children[0]);
        document.getElementById("messages").removeChild(children[0]);
    }
}

socket.on("chat message", (msg) => {
    addMessage(msg);
})
*/

switchToView("homeView");
setupCells("game");
setupCells("cardSelectTable");
setupOwnCard();