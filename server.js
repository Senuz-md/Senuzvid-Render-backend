const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Pro v13 - Fixed FB Engine 🚀"));

app.get("/api/download", async (req, res) => {
    let { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // Facebook ලින්ක් පිරිසිදු කිරීම (?fbclid= වැනි දේවල් අයින් කරයි)
        if (url.includes("facebook.com") || url.includes("fb.watch")) {
            url = url.split('?')[0];
        }

        // 1. TIKTOK (TikWM - සාර්ථකව වැඩ කරයි)
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            if(!d) throw new Error("TikTok Video not found");
            return res.redirect(quality === "audio" ? d.music : (d.hdplay || d.play));
        }

        // 2. FACEBOOK & INSTAGRAM (Working API Fix)
        if (url.includes("facebook.com") || url.includes("fb.watch") || url.includes("instagram.com")) {
            // අපි මෙතනදී API එකක් වෙනුවට ලින්ක් එක Generate කරන වෙනත් සර්වර් එකක් පාවිච්චි කරමු
            const fbRes = await axios.get(`https://api.boxvids.com/api/info?url=${encodeURIComponent(url)}`);
            
            if (fbRes.data && fbRes.data.url) {
                // සෘජුවම වීඩියෝ ලින්ක් එක ලබා දෙයි
                return res.redirect(fbRes.data.url);
            } else {
                // දෙවන විකල්පය (VkrDown)
                const vkrRes = await axios.get(`https://api.vkrdown.com/server/fb.php?url=${encodeURIComponent(url)}`);
                const links = vkrRes.data.data;
                const final = (quality === "1080" || quality === "720") ? (links.hd || links.sd) : links.sd;
                if(final) return res.redirect(final);
            }
        }

        // 3. YOUTUBE (Cobalt Fallback)
        const cobaltRes = await axios.post('https://api.cobalt.tools/', {
            url: url,
            videoQuality: quality || "720",
            youtubeVideoCodec: "h264"
        }, {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            timeout: 10000
        });

        if (cobaltRes.data && cobaltRes.data.url) {
            return res.redirect(cobaltRes.data.url);
        }

        throw new Error("No download link found");

    } catch (e) {
        console.error("DEBUG:", e.message);
        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: "සර්වර් එකේ බ්ලොක් එකක් පවතී. වෙනත් වීඩියෝවක් උත්සාහ කරන්න." 
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
        return res.json({ platform: "Social Media", title: "Ready", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    } catch (e) { res.json({ error: "Error" }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`FB Fix Pro on ${PORT}`));
