const colors = ["green", "red"];
const oppositeColor = { "green": "red", "red": "green" };

module.exports = class room {
    constructor(number, io) {
        this.players = {};
        this.turn = colors[0];

        this.number = number;
        this.roomName = "room" + number;

        this.io = io;

        this.killFunction = () => { }
    }

    addPlayer(socket, card) {
        if (Object.keys(this.players).length >= 2) return 0

        socket.join(this.roomName);

        socket.on("disconnect", () => {
            this.io.to(this.roomName).emit("gameEnd", { "error": "disconnect" });
            this.killFunction();
        });

        socket.emit("waitForPlayer");

        this.players[this.players[colors[0]] == undefined ? colors[0] : colors[1]] = { "card": card, "socket": socket }

        if (Object.keys(this.players).length === 2) this.#startGame();
    }

    #startGame() {
        for (var color in this.players) {
            var player = this.players[color]
            player.socket.emit("startgame", { "color": color, "opponentColor": oppositeColor[color] })
        }

        this.#startTurn();
    }

    #endTurn() {
        this.turn = oppositeColor[this.turn];

        this.#startTurn();
    }

    #startTurn() {
        this.io.to(this.roomName).emit("startTurn", { "turn": this.turn });

        this.players[this.turn].socket.once('guessCard', (card) => {
            this.players[this.turn].socket.removeAllListeners("question");

            if (card != this.players[oppositeColor[this.turn]].card) {
                this.#endTurn();
                return;
            }

            this.io.to(this.roomName).emit("gameEnd", { "won": this.turn, "greenCard": this.players.green.card, "redCard": this.players.red.card });
            this.killFunction();
        });

        this.players[this.turn].socket.once('question', (msg) => {
            this.players[oppositeColor[this.turn]].socket.emit('question', msg);
            this.players[this.turn].socket.removeAllListeners("guessCard");
        });

        this.players[oppositeColor[this.turn]].socket.once('answer', (msg) => {
            this.players[this.turn].socket.emit('answer', msg);

            this.players[this.turn].socket.once("endTurn", () => { this.#endTurn() });
        });
    }
}