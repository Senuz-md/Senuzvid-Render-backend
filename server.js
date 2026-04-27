const express = require("express");
const cors = require("cors");
const axios = require("axios");
const https = require("https");

const app = express();
app.use(cors());
app.use(express.json());

// SSL පද්ධතියේ දෝෂ මගහැරීමට (Very important for Cobalt)
const agent = new https.Agent({ rejectUnauthorized: false });

app.get("/", (req, res) => res.send("SenuzVid Engine v20 - Ultra Stable 🚀"));

app.get("/api/download", async (req, res) => {
    let { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // ලින්ක් එකේ තියෙන අනවශ්‍ය දත්ත ඉවත් කිරීම
        url = url.split('?')[0];

        // 1. TIKTOK (TikWM - 100% Stable)
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            if (d) return res.redirect(quality === "audio" ? d.music : (d.hdplay || d.play));
        }

        // 2. FACEBOOK, INSTAGRAM, YOUTUBE (Using Cobalt v10 Stable API)
        // අපි මෙතනදී පරණ API වෙනුවට දැනට වැඩ කරන Cobalt Instance එක පාවිච්චි කරනවා
        const cobaltData = {
            url: url,
            videoQuality: quality || "720",
            downloadMode: quality === "audio" ? "audio" : "video",
            youtubeVideoCodec: "h264",
            filenameStyle: "pretty"
        };

        const response = await axios.post('https://api.cobalt.tools/', cobaltData, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            httpsAgent: agent,
            timeout: 15000
        });

        if (response.data && response.data.url) {
            return res.redirect(response.data.url);
        }

        // 3. FALLBACK (වෙනත් API එකක් - cobalt සර්වර් එකේ ගැටලුවක් ආවොත් පමණක්)
        const fallback = await axios.post('https://cobalt-api.v-v.workers.dev/', cobaltData, {
            httpsAgent: agent,
            timeout: 10000
        });

        if (fallback.data && fallback.data.url) {
            return res.redirect(fallback.data.url);
        }

        throw new Error("ලින්ක් එක ලබාගැනීමට නොහැකි විය.");

    } catch (e) {
        console.error("DEBUG:", e.message);
        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: "API සර්වර් කාර්යබහුලයි. කරුණාකර නැවත උත්සාහ කරන්න.",
            debug: e.message 
        });
    }
});

app.get("/api/details", async (req, res) => {
    const { url } = req.query;
    try {
        if (url.includes("tiktok.com")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            return res.json({ platform: "TikTok", title: r.data.data.title, thumbnail: r.data.data.cover });
        }
        return res.json({ platform: "Social Media", title: "Video Found", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    } catch (e) { res.json({ error: "Error" }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 v20 Engine on port ${PORT}`));
