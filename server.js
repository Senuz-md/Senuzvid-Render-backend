// server.js — SenuzVid Render Optimized Edition

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// සර්වර් එක වැඩද බලන්න
app.get("/", (req, res) => {
    res.status(200).send("SenuzVid Engine is Live on Render! 🚀");
});

/* ================= DOWNLOAD LOGIC ================= */
app.get("/api/download", async (req, res) => {
    const { url, quality } = req.query;
    
    if (!url) return res.status(400).json({ error: "කරුණාකර URL එකක් ලබා දෙන්න." });

    try {
        // 1. TikTok Logic (TikWM API එක ඉතා ස්ථාවරයි)
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const data = response.data.data;
            if (!data) throw new Error("TikTok data not found");
            
            const dlLink = (quality === "audio") ? data.music : (data.hdplay || data.play);
            return res.redirect(dlLink);
        }

        // 2. YouTube, FB, IG, Twitter (Cobalt Engine)
        // Render වලදී 'api.cobalt.tools' සමහරවිට busy වෙන්න පුළුවන්, 
        // ඒ නිසා මේ headers අනිවාර්යයි.
        const cobaltResponse = await axios.post('https://api.cobalt.tools/api/json', {
            url: url,
            videoQuality: quality === "audio" ? "720" : quality, 
            downloadMode: quality === "audio" ? "audio" : "video",
            filenameStyle: "pretty"
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });

        if (cobaltResponse.data && cobaltResponse.data.url) {
            return res.redirect(cobaltResponse.data.url);
        } else {
            throw new Error("Engine process failed");
        }

    } catch (e) {
        console.error("Error Detail:", e.message);
        res.status(500).json({ 
            error: "සර්වර් එකේ බාධාවක්.", 
            msg: "සමහරවිට මෙම වීඩියෝව ලබා ගැනීමට Engine එකට අවසර නැත. නැවත උත්සාහ කරන්න." 
        });
    }
});

/* ================= DETAILS API ================= */
app.get("/api/details", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        if (url.includes("tiktok.com")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            return res.json({
                platform: "TikTok",
                title: d.title || "TikTok Video",
                thumbnail: d.cover,
                qualities: ["1080", "720", "audio"]
            });
        }

        // Generic details for YT/FB
        return res.json({
            platform: "Social Media",
            title: "Ready to Download",
            thumbnail: "https://files.catbox.moe/1dlcmm.jpg",
            qualities: ["1080", "720", "480", "audio"]
        });
    } catch (e) {
        res.status(500).json({ error: "Details fetch failed" });
    }
});

// Render වලට ගැලපෙන Port එක
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Engine running at port ${PORT}`);
});
