import { createServer } from 'http';
var server = createServer(handler);

import fs from 'fs';
import url from 'url';
import mime from 'mime';

import { Server } from "socket.io";
const io = new Server(server);

import { room } from "./server/room.js";

server.listen(8080);

var rooms = { number: 1, fullRooms: [] };

function handler(req, res) {
    var q = url.parse(req.url, true);

    if (q.pathname == "/version") { res.writeHead(200); res.write(String(change)); return res.end() }

    var path = q.pathname == '/' ? './client/index.html' : './client' + q.pathname;
    fs.readFile(path, function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }

        res.setHeader('Content-Type', mime.getType(path))
        res.setHeader('Cache-Control', 'punlib, max-age=86400')
        res.writeHead(200);
        res.write(data);
        return res.end();
    });
}

io.on('connection', (socket) => {
    socket.on("joinGame", (data) => {
        if (rooms.notFull === undefined) {
            var newRoom = new room(rooms.number, io);
            rooms.number++;

            newRoom.addPlayer(socket, data.card);
            newRoom.killFunction = () => { rooms.notFull = undefined; }

            rooms.notFull = newRoom;
            return;
        }

        rooms.notFull.addPlayer(socket, data.card);
        rooms.notFull.killFunction = () => { rooms.fullRooms.splice(rooms.fullRooms.indexOf(this)) }
        rooms.fullRooms.push(rooms.notFull)
        rooms.notFull = undefined
    })
});
