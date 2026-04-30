const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Pro Engine is Online! 🚀"));

// Details API
app.get("/api/details", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });
    try {
        if (url.includes("tiktok.com")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            if (r.data.data) return res.json({ title: r.data.data.title, thumbnail: r.data.data.cover });
        }
        res.json({ title: "Video Found", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    } catch (e) {
        res.json({ title: "Video Ready", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    }
});

// Download API (Using Dark-Shan API)
app.get("/api/download", async (req, res) => {
    const { url, quality } = req.query;
    if (!url) return res.status(400).send("URL missing");

    try {
        // 1. TikTok (TikWM) - මේක TikTok වලට හොඳම නිසා තියන්නම්
        if (url.includes("tiktok.com")) {
            const tk = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            if (tk.data.data) return res.redirect(quality === "audio" ? tk.data.data.music : tk.data.data.play);
        }

        // 2. Facebook (Dark-Shan API)
        if (url.includes("facebook.com") || url.includes("fb.watch")) {
            const fbRes = await axios.get(`https://api-dark-shan-yt.koyeb.app/download/facebook?url=${encodeURIComponent(url)}`);
            if (fbRes.data && fbRes.data.status) {
                const link = (quality === "audio") ? fbRes.data.result.audio : (fbRes.data.result.hd || fbRes.data.result.sd);
                if (link) return res.redirect(link);
            }
        }

        // 3. YouTube (Dark-Shan API)
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            const ytRes = await axios.get(`https://api-dark-shan-yt.koyeb.app/download/ytdl?url=${encodeURIComponent(url)}`);
            if (ytRes.data && ytRes.data.status) {
                const link = (quality === "audio") ? ytRes.data.result.mp3 : ytRes.data.result.mp4;
                if (link) return res.redirect(link);
            }
        }

        // 4. Backup - අනිත් හැම එකකටම (Instagram etc.)
        const backup = await axios.post('https://api.cobalt.tools/api/json', {
            url: url,
            videoQuality: "720",
        }, { headers: { 'Accept': 'application/json' }});
        
        if (backup.data && backup.data.url) return res.redirect(backup.data.url);

        res.status(404).send("වීඩියෝව සොයාගත නොහැක. කරුණාකර නැවත උත්සාහ කරන්න.");

    } catch (e) {
        console.error("API Error:", e.message);
        res.status(500).send("සර්වර් එකේ දෝෂයකි. කරුණාකර පසුව උත්සාහ කරන්න.");
    }
});

const PORT = 3070;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Engine Running on Port ${PORT}`));
