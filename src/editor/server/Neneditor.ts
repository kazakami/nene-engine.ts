
import * as Express from "express";
const app = Express();
// tslint:disable-next-line: no-var-requires
app.engine("ejs", require("ejs").__express);
app.set("view engine", "ejs");
app.get("/", (req, res) => {
    res.render(__dirname + "/../../lib/hoge.ejs", {
        content: "ほげ<br/>ふが",
        title: "タイトル",
    });
});

app.listen(3000, () => {
    console.log("Example app listening on port 3000!");
    console.log(__dirname);
});
