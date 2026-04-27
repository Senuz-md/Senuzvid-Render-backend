const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Premium Engine v16 - Active 🚀"));

app.get("/api/download", async (req, res) => {
    let { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // Facebook ලින්ක් පිරිසිදු කිරීම (Tracking/Ref අයින් කිරීම)
        if (url.includes("facebook.com") || url.includes("fb.watch") || url.includes("fb.com")) {
            url = url.split('?')[0];
        }

        // 1. TIKTOK - (TikWM)
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            if (d) return res.redirect(quality === "audio" ? d.music : (d.hdplay || d.play));
        }

        // 2. FACEBOOK - Premium Scraper Method
        // $85 සර්වර් එකකදී IP එක clean නිසා අපි වඩාත් ස්ථාවර API එකක් පාවිච්චි කරමු
        if (url.includes("facebook.com") || url.includes("fb.watch")) {
            const fbRes = await axios({
                method: 'get',
                url: `https://api.vkrdown.com/server/fb.php?url=${encodeURIComponent(url)}`,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                    'Accept': 'application/json'
                }
            });

            if (fbRes.data && fbRes.data.data) {
                const links = fbRes.data.data;
                const final = (quality === "1080" || quality === "720") ? (links.hd || links.sd) : links.sd;
                if (final) return res.redirect(final);
            }
        }

        // 3. YOUTUBE & OTHERS - (Cobalt v10 Update)
        // ප්‍රධාන සර්වර් එක බ්ලොක් නම් අපි unblockit instance එකට යමු
        const cobaltRes = await axios.post('https://cobalt.api.unblockit.win/', {
            url: url,
            videoQuality: quality || "720",
            downloadMode: quality === "audio" ? "audio" : "video",
            youtubeVideoCodec: "h264"
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'https://cobalt.tools',
                'Referer': 'https://cobalt.tools/'
            },
            timeout: 15000
        });

        if (cobaltRes.data && cobaltRes.data.url) {
            return res.redirect(cobaltRes.data.url);
        }

        throw new Error("No link found");

    } catch (e) {
        console.error("LOG:", e.message);
        // Error එකේදී redirect නොවී කෙලින්ම error එක පෙන්වමු test කරන්න
        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: e.message,
            hint: "Check if the video is Public and clean the URL."
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
        return res.json({ platform: "Video", title: "Video Found", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    } catch (e) { res.json({ error: "Error" }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Premium Engine on port ${PORT}`));
