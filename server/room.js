module.exports = class room {
    constructor(number) {
        this.players = {}
        
        this.number = number
        this.roomName = "room" + number
    }

    addPlayer(socket, name, card) {
        if (Object.keys(this.players).length >= 2) return 0

        socket.join(this.roomName);

        socket.on('chat message', (msg) => {
            socket.to(this.roomName).emit('chat message', msg);
        });

        this.players[name] = {"card": card}
    }
}