
import * as Express from "express";
import * as http from "http";
import * as socketio from "socket.io";

const app = Express();
const server = http.createServer(app);
const io = socketio(server);

// tslint:disable-next-line: no-var-requires
app.engine("ejs", require("ejs").__express);
app.set("view engine", "ejs");

const libDir = __dirname + "/../../";

app.get("/", (req, res) => {
    res.render(libDir + "hoge.ejs", {
        content: "ほげ<br/>ふが",
        title: "タイトル",
    });
});
app.use(Express.static(libDir));

io.on("connection", (socket) => {
    socket.on("poyo", (msg: string) => {
        console.log("rev");
        io.emit("poyo", msg);
    });
});

server.listen(3000, () => {
    console.log("Example app listening on port 3000!");
});
