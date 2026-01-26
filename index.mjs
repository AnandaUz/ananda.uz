import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import  api  from "./js/api.mjs";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 3000;

// нужно, чтобы корректно получить __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const articlesPath = path.join(__dirname, "views", "partials", "articles", "articles.json");
let articles = [];

try {
    const data = fs.readFileSync(articlesPath, "utf8");
    articles = JSON.parse(data);
} catch (err) {
    console.error("Ошибка при чтении файла со статьями:", err);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.render("index", { 
        title: "Шадрин",
        articles: articles
    });
});

app.get("/mastermind", (req, res) => {
    res.render("mastermind", { title: "| Мастермайнд" });
});
app.get("/coaching", (req, res) => {
    res.render("coaching", { title: "| Коучинг" });
});

app.get("/texts/:slug", (req, res) => {
    const article = articles.find(a => a.slug === req.params.slug);
    if (article) {
        res.render("article", { 
            title: `| ${article.title}`, 
            article: article 
        });
    } else {
        res.status(404).send("Статья не найдена");
    }
});

// маршрут для Telegram
app.post("/api/bot", api);



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});