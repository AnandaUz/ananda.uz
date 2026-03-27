import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import  api, { sendMessageToAdmin }  from "./js/api.mjs";

import bodyParser from "body-parser";




const app = express();
const port = process.env.PORT || 2000;

app.locals.formatDate = function (dateStr) {
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
};

// нужно, чтобы корректно получить __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const articlesPath = path.join(__dirname, "views", "partials", "articles", "articles.json");
let articles = [];

//- читает данные по статьям --------
try {
    const data = fs.readFileSync(articlesPath, "utf8");
    articles = JSON.parse(data);
} catch (err) {
    console.error("Ошибка при чтении файла со статьями:", err);
}
app.locals.articles = articles;
//-

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(express.json());

app.get("/", (req, res) => {
    res.render("index", { 
        title: "Шадрин",
        articles: articles
    });
});

app.get("/mastermind", (req, res) => {
    res.render("mastermind", { title: "| Мастермайнд" });
});
app.get("/admin", (req, res) => {
    res.render("admin");
});
app.get("/coaching", (req, res) => {
    res.render("coaching", { title: "| Коучинг" });
});
app.get("/privacy-policy", (req, res) => {
    res.render("privacy-policy", { title: "| Коучинг" });
});

app.get(["/guide", "/file"], (req, res) => {
    res.render("layout", {
        title: "| Скачать файл",
        centerPartial: "partials/center-guide"
    });
});
app.get(["/meet"], (req, res) => {
    res.render("layout", {
        title: "| Встреча",
        centerPartial: "partials/center-meet"
    });
});
app.get(["/texts/:slug", "/texts/:slug/:page"], (req, res) => {
    const article = articles.find(a => a.slug === req.params.slug);
    if (article) {
        let currentPage = parseInt(req.params.page) || 1;
        let contentPartial = article.contentPartial;
        
        if (article.totalPages) {
            if (currentPage < 1) currentPage = 1;
            if (currentPage > article.totalPages) currentPage = article.totalPages;
            contentPartial = `${article.contentPartial}_${currentPage}`;
        }

        res.render("article", { 
            title: `| ${article.title}`, 
            article: article,
            currentPage: currentPage,
            contentPartial: contentPartial
        });
    } else {
        res.status(404).send("Статья не найдена");
    }
});

// маршрут для Telegram
app.post("/api/bot", api);

app.post("/api/submit-form", async (req, res) => {
    const { userName, userContact } = req.body;
    
    if (!userName || !userContact) {
        return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const message = `📩 <b>Новая заявка с сайта (Встреча)</b>\n\n👤 Имя: ${userName}\n📞 Контакт: ${userContact}`;
    
    const result = await sendMessageToAdmin(message);
    
    if (result.success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, error: result.error });
    }
});

//+bot ISeeWeight




//-bot ISeeWeight
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
