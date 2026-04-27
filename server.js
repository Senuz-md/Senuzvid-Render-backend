const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Engine v10 - Ultimate Stable 🚀"));

app.get("/api/download", async (req, res) => {
    const { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // TikTok - TikWM (ඉතා ස්ථාවරයි)
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            return res.redirect(quality === "audio" ? d.music : (d.hdplay || d.play));
        }

        // Cobalt v10 Logic
        // වැදගත්: මෙහි අගට /api/json හෝ වෙනත් කිසිවක් එක් නොකරන්න
        const cobaltApi = 'https://api.cobalt.tools/'; 
        
        const response = await axios.post(cobaltApi, {
            url: url,
            videoQuality: quality === "audio" ? "720" : (quality || "720"),
            downloadMode: quality === "audio" ? "audio" : "video",
            youtubeVideoCodec: "h264",
            filenameStyle: "pretty"
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'https://cobalt.tools',
                'Referer': 'https://cobalt.tools/'
            }
        });

        if (response.data && response.data.url) {
            return res.redirect(response.data.url);
        } else {
            throw new Error(response.data.text || "Engine Error");
        }

    } catch (e) {
        // Render logs වල error එක බැලීමට
        console.error("DEBUG:", e.response ? e.response.data : e.message);
        
        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: "Please Clear Cache and Re-deploy on Render." 
        });
    }
});

app.get("/api/details", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });
    try {
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            return res.json({ platform: "TikTok", title: d.title, thumbnail: d.cover });
        }
        return res.json({ platform: "Social Media", title: "Ready", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    } catch (e) { res.status(500).json({ error: "Error" }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server on ${PORT}`));
