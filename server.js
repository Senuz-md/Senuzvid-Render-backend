const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Engine v14 - Ultra FB Fix 🚀"));

app.get("/api/download", async (req, res) => {
    let { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // Facebook ලින්ක් එකේ තියෙන අනවශ්‍ය tracking parameters ඉවත් කිරීම
        if (url.includes("facebook.com") || url.includes("fb.watch")) {
            url = url.split('?')[0];
        }

        // 1. TIKTOK (TikWM - ඉතා ස්ථාවරයි)
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            if (d) return res.redirect(quality === "audio" ? d.music : (d.hdplay || d.play));
        }

        // 2. FACEBOOK & INSTAGRAM (Alternative Stable API)
        // අපි මෙතනදී Render වල IP එක බ්ලොක් නොවන API එකක් පාවිච්චි කරනවා
        if (url.includes("facebook.com") || url.includes("fb.watch") || url.includes("instagram.com")) {
            try {
                // පළමු උත්සාහය - SaveFrom API style
                const fbRes = await axios.get(`https://api.vkrdown.com/server/fb.php?url=${encodeURIComponent(url)}`);
                const links = fbRes.data.data;
                if (links) {
                    const final = (quality === "1080" || quality === "720") ? (links.hd || links.sd) : links.sd;
                    if (final) return res.redirect(final);
                }
            } catch (fbErr) {
                console.log("FB Method 1 failed, trying Method 2...");
            }
        }

        // 3. YOUTUBE & ALL OTHERS (Fallback to working Cobalt Instance)
        // api.cobalt.tools වෙනුවට බ්ලොක් නොවූ වෙනත් සර්වර් එකක් පාවිච්චි කිරීම
        const cobaltRes = await axios.post('https://cobalt.api.unblockit.win/', {
            url: url,
            videoQuality: quality || "720",
            youtubeVideoCodec: "h264"
        }, {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            timeout: 12000
        });

        if (cobaltRes.data && cobaltRes.data.url) {
            return res.redirect(cobaltRes.data.url);
        }

        throw new Error("No link found");

    } catch (e) {
        console.error("DEBUG:", e.message);
        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: "FB සර්වර් එකේ බ්ලොක් එකක් පවතී. වෙනත් වීඩියෝ ලින්ක් එකක් උත්සාහ කරන්න." 
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
        return res.json({ platform: "Social Media", title: "Video Found", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    } catch (e) { res.json({ error: "Error" }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Engine on port ${PORT}`));
