const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Engine v10.0 - Active 🚀"));

/* ================= DOWNLOAD LOGIC ================= */
app.get("/api/download", async (req, res) => {
    const { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // 1. TIKTOK (TikWM)
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            const dlLink = (quality === "audio") ? d.music : (d.hdplay || d.play);
            return res.redirect(dlLink);
        }

        // 2. COBALT V10 (YouTube, FB, IG)
        // වගබලා ගන්න: URL එක 'https://api.cobalt.tools/' විය යුතුයි (අගට json නැත)
        const cobaltConfig = {
            url: url,
            videoQuality: quality === "audio" ? "720" : (quality || "720"),
            downloadMode: quality === "audio" ? "audio" : "video",
            youtubeVideoCodec: "h264"
        };

        const cobaltResponse = await axios.post('https://api.cobalt.tools/', cobaltConfig, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // Response එකේ 'url' තිබේදැයි බලන්න
        if (cobaltResponse.data && cobaltResponse.data.url) {
            return res.redirect(cobaltResponse.data.url);
        } else {
            // වෙනත් විදියක error එකක් ආවොත් ඒක පෙන්වන්න
            throw new Error(cobaltResponse.data.text || "Engine response error");
        }

    } catch (e) {
        // Log the actual error to Render dashboard
        console.error("V10 Error:", e.response ? e.response.data : e.message);
        
        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: "API එකේ පරණ සංස්කරණය ඉවත් කර අලුත් එකට මාරු වන්න." 
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
