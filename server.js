const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Engine is Live! 🚀"));

app.get("/api/download", async (req, res) => {
    const { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // --- TIKTOK (TikWM API - No Block) ---
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            if(!d) throw new Error("Video not found");
            return res.redirect(quality === "audio" ? d.music : (d.hdplay || d.play));
        }

        // --- FACEBOOK & INSTAGRAM (Alternative Fast API) ---
        if (url.includes("facebook.com") || url.includes("fb.watch") || url.includes("instagram.com")) {
            // මෙතනදී අපි Cobalt වෙනුවට වඩාත් ස්ථාවර Social Media Downloader API එකක් පාවිච්චි කරනවා
            const fbRes = await axios.get(`https://api.vkrdown.com/server/fb.php?url=${encodeURIComponent(url)}`);
            
            if (fbRes.data && fbRes.data.data) {
                const links = fbRes.data.data;
                // Quality එක අනුව HD හෝ SD තෝරාගැනීම
                const finalLink = (quality === "1080" || quality === "720") ? (links.hd || links.sd) : links.sd;
                return res.redirect(finalLink);
            }
        }

        // --- YOUTUBE & OTHER (Last Resort Fallback) ---
        const fallbackRes = await axios.post('https://cobalt.api.unblockit.win/', {
            url: url,
            videoQuality: quality || "720",
            filenameStyle: "pretty"
        }, { timeout: 10000 });

        if (fallbackRes.data.url) return res.redirect(fallbackRes.data.url);

        throw new Error("All methods failed");

    } catch (e) {
        console.error("DEBUG:", e.message);
        res.status(500).json({ 
            error: "බාගත කිරීමේ දෝෂයකි.", 
            details: "මෙම වීඩියෝව දැනට ලබාගත නොහැක. වෙනත් ලින්ක් එකක් උත්සාහ කරන්න." 
        });
    }
});

app.get("/api/details", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });
    try {
        if (url.includes("tiktok.com")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            return res.json({ platform: "TikTok", title: r.data.data.title, thumbnail: r.data.data.cover });
        }
        return res.json({ platform: "Social Media", title: "Ready to Download", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    } catch (e) { res.status(500).json({ error: "Details error" }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Stable Engine on ${PORT}`));
