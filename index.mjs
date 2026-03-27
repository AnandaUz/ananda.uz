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
app.get(["/meet"], async (req, res) => {
    // 1. Собираем данные из запроса
    const userAgent = req.headers['user-agent'] || "Unknown device";
    const isMobile = /Mobile|Android|iPhone/i.test(userAgent) ? "📱" : "💻";

    // 2. Достаем язык (поможет понять, откуда примерно человек)
    const language = req.headers['accept-language']?.split(',')[0] || "Не определен";

    // 3. Вытаскиваем UTM-метку (если ты добавил их в рекламе)
    // Например: esho.uz/meet?utm_content=silavoli

    const referer = req.headers['referer'] || "🌸";

    const browserName = userAgent.split(') ')[1]?.split(' ')[0] || "Видит ваш сайт"
    const { utm_source, utm_medium, utm_campaign, utm_content, utm_term } = req.query;

    const utmString = [utm_source, utm_medium, utm_campaign, utm_content, utm_term]
        .filter(value => value) // Убираем пустые значения
        .join(" 🔅 ");

    const now = new Date();
    const tashkentTime = new Date(now.getTime() + (5 * 60 * 60 * 1000)); // +5 часов
    const dateStr = tashkentTime.toISOString()
        .replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}).*/, '$3.$2.$1 $4:$5');

    // Формируем "радующую" сводку
    const message = `${dateStr} ${isMobile} 🔸 ${language} 🔸 ${browserName} 🔸 ${referer} 🔸 ${utmString}`;

    await sendMessageToAdmin(message);

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

    const message = `📩 <b>Новая заявка с сайта (Встреча)</b>\n\nИмя: ${userName}\nКонтакт: ${userContact}`;
    
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
