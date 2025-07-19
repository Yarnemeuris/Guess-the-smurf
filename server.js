var server = require("http").createServer(handler);
var fs = require('fs');
var url = require('url');

const { Server } = require("socket.io");
const io = new Server(server);

server.listen(8080);

function handler(req, res) {
    var q = url.parse(req.url, true);

    if (q.pathname == "/version") { res.writeHead(200); res.write(String(change)); return res.end() }

    var path = q.pathname == '/' ? __dirname + '/client/index.html' : __dirname + '/client' + q.pathname;
    fs.readFile(path, function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            //console.log(err)
            return res.end("404 Not Found");
        }
        switch (path.split(".")[1]) {
            case "html":
                res.writeHead(200, { 'Content-Type': 'text/html' });
                break;
            case "css":
                res.writeHead(200, { 'Content-Type': 'text/css' });
                break;
            case "js":
                res.writeHead(200, { 'Content-Type': 'text/javascript' });
                break;
            case "png":
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                break;
            case "txt":
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                break;
            case "webp":
                res.writeHead(200, { 'Content-Type': 'image/webp'});
                break;
            default:
                res.writeHead(200);
                console.log(path.split(".")[1]);
        }
        res.write(data);
        return res.end();
    });
}

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', msg);
  });
});
