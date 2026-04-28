const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Ultimate Engine v50 - Active 🚀"));

// Video Details API - Thumbnail එක සහ Title එක හරියටම ගන්න
app.get("/api/details", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // TikTok සඳහා විශේෂිතව
        if (url.includes("tiktok.com")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            if (r.data.data) {
                return res.json({
                    title: r.data.data.title || "TikTok Video",
                    thumbnail: r.data.data.cover
                });
            }
        }
        
        // FB, YT සහ අනෙකුත් ඒවට පොදු Thumbnail එකක් (Loading එක පෙන්වන්න)
        res.json({
            title: "Video Found - Processing...",
            thumbnail: "https://files.catbox.moe/1dlcmm.jpg"
        });
    } catch (e) {
        res.json({ title: "Video Found", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    }
});

// Download API - FB, YT, TikTok සියල්ලටම
app.get("/api/download", async (req, res) => {
    const { url, quality } = req.query;
    if (!url) return res.status(400).send("URL missing");

    try {
        const cleanUrl = url.split('?')[0];

        // ක්‍රමය 1: FB/Youtube (AIO API)
        const res1 = await axios.get(`https://api.vkrdown.com/server/wrapper.php?url=${encodeURIComponent(cleanUrl)}`);
        
        if (res1.data && res1.data.data) {
            const d = res1.data.data;
            // HD තියෙනවා නම් ඒක ගන්න, නැත්නම් SD
            const dlLink = quality === "audio" ? d.audio : (d.hd || d.url || d.mp4);
            if (dlLink) return res.redirect(dlLink);
        }

        // ක්‍රමය 2: TikTok (TikWM)
        if (cleanUrl.includes("tiktok.com")) {
            const res2 = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`);
            if (res2.data.data) {
                return res.redirect(quality === "audio" ? res2.data.data.music : res2.data.data.play);
            }
        }

        throw new Error("All methods failed");
    } catch (e) {
        console.log("Download Error:", e.message);
        res.status(500).send("සර්වර් එක සමඟ සම්බන්ධ විය නොහැක. පසුව උත්සාහ කරන්න.");
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Engine v50 on port ${PORT}`));
