const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Bypass Engine v40 🚀"));

app.get("/api/download", async (req, res) => {
    const { url, quality } = req.query;
    if (!url) return res.status(400).send("URL missing");

    const cleanUrl = url.split('?')[0];

    // ක්‍රමය 1: FB/Instagram සඳහා (SnapSave API - Very Strong)
    try {
        const res1 = await axios.get(`https://api.vkrdown.com/server/fb.php?url=${encodeURIComponent(cleanUrl)}`);
        if (res1.data && res1.data.data) {
            const link = quality === "audio" ? res1.data.data.audio : (res1.data.data.hd || res1.data.data.sd);
            if (link) return res.redirect(link);
        }
    } catch (e) { console.log("Method 1 failed"); }

    // ක්‍රමය 2: TikTok සඳහා (TikWM)
    if (cleanUrl.includes("tiktok.com")) {
        try {
            const res2 = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`);
            if (res2.data.data) return res.redirect(res2.data.data.play);
        } catch (e) { console.log("Method 2 failed"); }
    }

    // ක්‍රමය 3: YouTube/All සඳහා (SaveFrom Bypass)
    try {
        const res3 = await axios.post('https://save-from.net/api/convert', { url: cleanUrl });
        if (res3.data && res3.data.url[0].url) {
            return res.redirect(res3.data.url[0].url);
        }
    } catch (e) { console.log("Method 3 failed"); }

    res.status(500).json({ error: "සියලුම ක්‍රම අසාර්ථක විය. ලින්ක් එකේ ගැටලුවකි." });
});

app.get("/api/details", async (req, res) => {
    res.json({ platform: "Video", title: "Video Ready", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Engine v40 Active`));
