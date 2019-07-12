import http = require("http");

const s = http.createServer((req, res) => {
    console.log(req.url);
    res.writeHead(200, {
        "Content-Type": "text/html",
    });
    res.end("hoge\n");
});
s.listen(8080);
