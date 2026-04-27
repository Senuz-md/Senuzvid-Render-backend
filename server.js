const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Engine v10 - Online! 🚀"));

/* ================= DOWNLOAD LOGIC (Cobalt v10) ================= */
app.get("/api/download", async (req, res) => {
    const { url, quality } = req.query; 
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // 1. TIKTOK LOGIC (TikWM) - මෙය පෙර පරිදිම වැඩ කරයි
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            const dlLink = (quality === "audio") ? d.music : (d.hdplay || d.play);
            return res.redirect(dlLink);
        }

        // 2. COBALT V10 LOGIC (YouTube, FB, IG)
        // v10 එකේදී API එකේ ලින්ක් එක 'https://api.cobalt.tools/' (අන්තිමට json නැත)
        const cobaltConfig = {
            url: url,
            videoQuality: quality === "audio" ? "720" : (quality || "720"),
            downloadMode: quality === "audio" ? "audio" : "video",
            youtubeVideoCodec: "h264",
            filenameStyle: "pretty"
        };

        const cobaltResponse = await axios.post('https://api.cobalt.tools/', cobaltConfig, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // v10 එකේදී response එක එන්නේ 'url' හෝ 'stream' විදිහටයි
        if (cobaltResponse.data && cobaltResponse.data.url) {
            return res.redirect(cobaltResponse.data.url);
        } else if (cobaltResponse.data && cobaltResponse.data.status === "redirect") {
            return res.redirect(cobaltResponse.data.url);
        } else {
            throw new Error(cobaltResponse.data.text || "Engine Error");
        }

    } catch (e) {
        console.error("Engine Error:", e.response ? e.response.data : e.message);
        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: "API එකේ තදබදයක් හෝ ලින්ක් එකේ දෝෂයකි. පසුව උත්සාහ කරන්න." 
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
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 v10 Server running on port ${PORT}`));
