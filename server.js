const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Engine v3.0 - Stable 🚀"));

/* ================= DOWNLOAD LOGIC ================= */
app.get("/api/download", async (req, res) => {
    const { url, quality } = req.query; // quality examples: 1080, 720, 480, audio
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // 1. TIKTOK LOGIC (TikWM)
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            const dlLink = (quality === "audio") ? d.music : (d.hdplay || d.play);
            return res.redirect(dlLink);
        }

        // 2. UPDATED COBALT LOGIC (Fixing 400 Error)
        // Cobalt දැන් 'quality' කියන නම සහ අලුත් format එකක් පාවිච්චි කරයි
        const cobaltData = {
            url: url,
            videoQuality: quality === "audio" ? "720" : (quality || "720"),
            downloadMode: quality === "audio" ? "audio" : "video",
            youtubeVideoCodec: "h264",
            filenameStyle: "pretty",
            isAudioOnly: quality === "audio"
        };

        const cobaltResponse = await axios.post('https://api.cobalt.tools/api/json', cobaltData, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Cobalt වෙලාවකට direct link එකක් වෙනුවට stream link එකක් දෙයි
        if (cobaltResponse.data && cobaltResponse.data.url) {
            return res.redirect(cobaltResponse.data.url);
        } else if (cobaltResponse.data && cobaltResponse.data.text) {
            // සමහරවිට text එකක් විදියට error එකක් එවන්න පුළුවන්
            throw new Error(cobaltResponse.data.text);
        } else {
            throw new Error("Invalid response from engine.");
        }

    } catch (e) {
        // Error එක හරියටම බලාගන්න log එකක් දාමු
        console.error("Engine Error Details:", e.response ? e.response.data : e.message);
        
        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: e.response ? e.response.data.text : e.message 
        });
    }
});

/* ================= DETAILS API ================= */
app.get("/api/details", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
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
        
        // YouTube, FB, IG සඳහා පොදු response එක
        return res.json({
            platform: "Social Media",
            title: "Ready to Download",
            thumbnail: "https://files.catbox.moe/1dlcmm.jpg",
            qualities: ["1080", "720", "480", "audio"]
        });
    } catch (e) {
        res.status(500).json({ error: "Error fetching details" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
