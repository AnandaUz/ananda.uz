import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import  api  from "./js/api.mjs";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 3000;

// нужно, чтобы корректно получить __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.render("index", { title: "Шадрин" });
});

app.get("/mastermind", (req, res) => {
    res.render("mastermind", { title: "| Мастермайнд" });
});
app.get("/coaching", (req, res) => {
    res.render("coaching", { title: "| Коучинг" });
});

// маршрут для Telegram
app.post("/api/bot", api);



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});