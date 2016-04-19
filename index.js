var http = require('http')

var server = http.createServer(function (req, res) {
    console.log(req.socket.remoteAddress);
    console.log(req.connection === req.socket);
}).listen(8000);
