// server.js — SenuzVid Multi-Downloader (Render Edition)
// පාවිච්චි කර ඇති Libraries: express, cors, axios

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// සර්වර් එක වැඩ දැයි පරීක්ෂා කිරීමට (Health Check)
app.get("/", (req, res) => {
    res.status(200).send("🚀 SenuzVid Engine is Online & Stable!");
});

/* ================= DOWNLOAD LOGIC ================= */
app.get("/api/download", async (req, res) => {
    const { url, quality } = req.query;

    if (!url) {
        return res.status(400).json({ error: "URL එක ඇතුළත් කර නැත!" });
    }

    try {
        // 1. TIKTOK LOGIC (TikWM API)
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const data = response.data.data;
            
            if (!data) throw new Error("TikTok data not found");

            // Quality එක අනුව ලින්ක් එක තෝරා ගැනීම
            const dlLink = (quality === "audio") ? data.music : (data.hdplay || data.play);
            return res.redirect(dlLink);
        }

        // 2. FB, YT, IG, TWITTER LOGIC (Cobalt Engine)
        const cobaltResponse = await axios.post('https://api.cobalt.tools/api/json', {
            url: url,
            videoQuality: (quality === "audio") ? "720" : (quality || "720"),
            downloadMode: (quality === "audio") ? "audio" : "video",
            filenameStyle: "pretty"
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (cobaltResponse.data && cobaltResponse.data.url) {
            return res.redirect(cobaltResponse.data.url);
        } else {
            throw new Error("Could not fetch link from Cobalt Engine.");
        }

    } catch (error) {
        console.error("Download Error:", error.message);
        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: error.message 
        });
    }
});

/* ================= DETAILS API ================= */
app.get("/api/details", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // TikTok සඳහා විස්තර ලබා ගැනීම
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            return res.json({
                platform: "TikTok",
                title: d.title || "TikTok Video",
                thumbnail: d.cover,
                qualities: ["1080", "720", "audio"]
            });
        }

        // YouTube, FB සහ අනෙකුත් ඒවා සඳහා සාමාන්‍ය විස්තර
        let platform = "Social Media";
        if (url.includes("youtube.com") || url.includes("youtu.be")) platform = "YouTube";
        if (url.includes("facebook.com") || url.includes("fb.watch")) platform = "Facebook";

        return res.json({
            platform: platform,
            title: `${platform} Video Found`,
            thumbnail: "https://files.catbox.moe/1dlcmm.jpg", // Default image
            qualities: ["1080", "720", "480", "audio"]
        });

    } catch (e) {
        res.status(500).json({ error: "Details fetch failed" });
    }
});

// Render Port Configuration
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ SenuzVid is running on port ${PORT}`);
});
