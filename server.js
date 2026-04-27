const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// සර්වර් එක වැඩද බලන්න (Health Check)
app.get("/", (req, res) => res.send("SenuzVid Engine v10.5 - Pro Active 🚀"));

/* ================= DOWNLOAD LOGIC ================= */
app.get("/api/download", async (req, res) => {
    const { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    // TikTok සඳහා (TikWM - ඉතාමත් ස්ථාවරයි)
    if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
        try {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            return res.redirect(quality === "audio" ? d.music : (d.hdplay || d.play));
        } catch (e) {
            return res.status(500).json({ error: "TikTok download failed" });
        }
    }

    // FB, YT, IG සඳහා Cobalt v10 Fallback පද්ධතිය
    // ප්‍රධාන සර්වර් එක වැඩ නැත්නම් ඊළඟ එකට මාරු වේ.
    const cobaltInstances = [
        'https://api.cobalt.tools/',
        'https://cobalt.api.unblockit.win/',
        'https://cobalt-api.v-v.workers.dev/'
    ];

    let success = false;

    for (let instance of cobaltInstances) {
        try {
            const response = await axios.post(instance, {
                url: url,
                videoQuality: quality === "audio" ? "720" : (quality || "720"),
                downloadMode: quality === "audio" ? "audio" : "video",
                youtubeVideoCodec: "h264",
                filenameStyle: "pretty"
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: 8000 // තත්පර 8කින් වැඩ නැත්නම් ඊළඟ සර්වර් එකට යයි
            });

            if (response.data && response.data.url) {
                return res.redirect(response.data.url);
                success = true;
                break;
            }
        } catch (e) {
            console.log(`Instance ${instance} failed, trying next...`);
            continue; // ඊළඟ සර්වර් එක බලන්න
        }
    }

    if (!success) {
        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: "සියලුම API සර්වර් කාර්යබහුලයි. කරුණාකර සුළු මොහොතකින් නැවත උත්සාහ කරන්න." 
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
        res.status(500).json({ error: "Details fetch failed" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Final Engine on port ${PORT}`));
