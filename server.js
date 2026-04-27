const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Engine v12 - FB Fix Active! 🚀"));

app.get("/api/download", async (req, res) => {
    let { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // ලින්ක් එකේ අග තියෙන අනවශ්‍ය කෑලි (Tracking) අයින් කිරීම
        url = url.split('?')[0];

        // 1. TIKTOK (TikWM - Stable)
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            return res.redirect(quality === "audio" ? d.music : (d.hdplay || d.play));
        }

        // 2. FACEBOOK & INSTAGRAM (Special Fix)
        // මෙතනදී අපි Cobalt වෙනුවට FB වලට විශේෂිත වූ API එකක් පාවිච්චි කරනවා
        if (url.includes("facebook.com") || url.includes("fb.watch") || url.includes("instagram.com")) {
            const fbRes = await axios.get(`https://api.vkrdown.com/server/fb.php?url=${encodeURIComponent(url)}`);
            
            if (fbRes.data && fbRes.data.data) {
                const links = fbRes.data.data;
                // Quality එක අනුව HD හෝ SD තෝරාගැනීම
                let finalLink = (quality === "1080" || quality === "720") ? (links.hd || links.sd) : links.sd;
                
                if (finalLink) return res.redirect(finalLink);
            }
        }

        // 3. YOUTUBE & OTHERS (Using Cobalt v10)
        const cobaltConfig = {
            url: url,
            videoQuality: quality || "720",
            downloadMode: quality === "audio" ? "audio" : "video",
            youtubeVideoCodec: "h264"
        };

        const cobaltRes = await axios.post('https://api.cobalt.tools/', cobaltConfig, {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            timeout: 10000
        });

        if (cobaltRes.data && cobaltRes.data.url) {
            return res.redirect(cobaltRes.data.url);
        }

        throw new Error("Video link not generated");

    } catch (e) {
        console.error("Error:", e.message);
        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: "FB/YT සර්වර් එකේ ගැටලුවකි. වෙනත් ලින්ක් එකක් උත්සාහ කරන්න." 
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
        return res.json({ platform: "Social Media", title: "Ready to Download", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    } catch (e) { res.json({ error: "Error" }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`FB Fix Engine on ${PORT}`));
