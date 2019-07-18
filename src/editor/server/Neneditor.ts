
import * as Express from "express";
const app = Express();
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

app.listen(3000, () => {
    console.log("Example app listening on port 3000!");
});
