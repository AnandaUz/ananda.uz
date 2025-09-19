import fetch from "node-fetch"; // node 18+ встроен fetch

const url = "http://localhost:3000/api/bot";
const body = {
    message: {
        "update_id": 123456,
        "message": {
            "message_id": 1,
            "from": { "id": 111, "is_bot": false, "first_name": "Ananda" },
            "chat": { "id": 111, "first_name": "Ananda", "type": "private" },
            "date": 1695043200,
            "text": "/start mastermind",
            "entities": [{ "offset": 0, "length": 6, "type": "bot_command" }]
        }
    }

};

(async () => {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    console.log("status:", res.status);
    console.log(await res.text());
})();


