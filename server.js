const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Premium Engine v35 - Active 🚀"));

// Video Details API
app.get("/api/details", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });
    try {
        if (url.includes("tiktok.com")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            return res.json({ 
                platform: "TikTok", 
                title: r.data.data.title || "TikTok Video", 
                thumbnail: r.data.data.cover 
            });
        }
        // General Details
        res.json({ 
            platform: "Social Media", 
            title: "Video Found", 
            thumbnail: "https://files.catbox.moe/1dlcmm.jpg" 
        });
    } catch (e) {
        res.status(500).json({ error: "Details fetch failed" });
    }
});

// Main Download API
app.get("/api/download", async (req, res) => {
    let { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        const cleanUrl = url.split('?')[0];

        // 1. TikTok Logic
        if (cleanUrl.includes("tiktok.com")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`);
            const d = r.data.data;
            if (d) return res.redirect(quality === "audio" ? d.music : (d.hdplay || d.play));
        }

        // 2. Multi-Platform Logic (FB, YT, IG) - Using Cobalt
        const cobaltRes = await axios.post('https://api.cobalt.tools/', {
            url: cleanUrl,
            videoQuality: quality || "720",
            downloadMode: quality === "audio" ? "audio" : "video",
            youtubeVideoCodec: "h264"
        }, {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            timeout: 20000 
        });

        if (cobaltRes.data && cobaltRes.data.url) {
            return res.redirect(cobaltRes.data.url);
        }

        throw new Error("API could not generate link");

    } catch (e) {
        console.error("DL Error:", e.message);
        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: "සර්වර් එකේ ගැටලුවක් පවතී. පසුව උත්සාහ කරන්න." 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Premium Engine on port ${PORT}`));
