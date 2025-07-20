const colors = ["green", "red"];
const oppositeColor = { "green": "red", "red": "green" };

module.exports = class room {
    constructor(number) {
        this.players = {}

        this.number = number
        this.roomName = "room" + number
    }

    addPlayer(socket, card) {
        if (Object.keys(this.players).length >= 2) return 0

        socket.join(this.roomName);

        socket.emit("waitForPlayer");

        socket.on('chat message', (msg) => {
            socket.to(this.roomName).emit('chat message', msg);
        });

        this.players[this.players[colors[0]] == undefined ? colors[0] : colors[1]] = { "card": card, "socket": socket }

        if (Object.keys(this.players).length === 2) this.#startGame();
    }

    #startGame() {
        for (var color in this.players) {
            var player = this.players[color]
            player.socket.emit("startgame", { "color": color, "opponentColor": oppositeColor[color] })
        }
    }
}