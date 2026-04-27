const express = require("express");
const cors = require("cors");
const axios = require("axios");
const https = require("https");

const app = express();
app.use(cors());
app.use(express.json());

// SSL Certificate ගැටලු මගහැරීමට (ignore certificate errors)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

app.get("/", (req, res) => res.send("SenuzVid Premium Engine v18 - SSL Fixed 🚀"));

app.get("/api/download", async (req, res) => {
    let { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        url = url.split('?')[0]; // ලින්ක් එක පිරිසිදු කිරීම

        // 1. TIKTOK - TikWM (ඉතාමත් ස්ථාවරයි)
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            if (d) return res.redirect(quality === "audio" ? d.music : (d.hdplay || d.play));
        }

        // 2. FACEBOOK & OTHERS - Multi-API Engine
        // අපි මෙතනදී කෙලින්ම Cobalt එකේ නිල API එක සහ තවත් සර්වර් එකක් පාවිච්චි කරනවා
        const instances = [
            'https://api.cobalt.tools/',
            'https://cobalt.api.unblockit.win/'
        ];

        let downloadUrl = null;

        for (let base of instances) {
            try {
                const response = await axios.post(base, {
                    url: url,
                    videoQuality: quality || "720",
                    youtubeVideoCodec: "h264"
                }, {
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    httpsAgent: httpsAgent, // SSL Error එක මෙතනින් විසඳයි
                    timeout: 10000
                });

                if (response.data && response.data.url) {
                    downloadUrl = response.data.url;
                    break;
                }
            } catch (err) {
                console.log(`Failed for instance: ${base}`);
                continue;
            }
        }

        if (downloadUrl) return res.redirect(downloadUrl);

        // 3. FB සෘජු විකල්පය (VkrDown - SSL Fixed)
        const fbAlt = await axios.get(`https://api.boxvids.com/api/info?url=${encodeURIComponent(url)}`, {
            httpsAgent: httpsAgent
        });
        if (fbAlt.data && fbAlt.data.url) return res.redirect(fbAlt.data.url);

        throw new Error("No valid download link found.");

    } catch (e) {
        console.error("LOG:", e.message);
        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: "සර්වර් එකේ SSL හෝ Connection දෝෂයකි.",
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
        return res.json({ platform: "Video", title: "Video Ready", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    } catch (e) { res.json({ error: "Error" }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 v18 Engine on port ${PORT}`));
